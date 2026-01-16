-- GYANVEDU V2.1 COURSES SCHEMA
-- This script sets up the full database structure for the courses feature.

-- 1. Custom Types
CREATE TYPE public.course_difficulty AS ENUM (
    'Beginner',
    'Intermediate',
    'Advanced'
);

-- 2. Tables
-- Courses Table: Stores the main course information.
CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    difficulty public.course_difficulty DEFAULT 'Beginner',
    category text,
    cover_image_url text,
    is_published boolean DEFAULT false NOT NULL,
    price numeric(10, 2) DEFAULT 0.00,
    duration_hours integer
);
COMMENT ON TABLE public.courses IS 'Main table to store course information.';

-- Course Modules Table: Breaks a course down into modules or sections.
CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    module_order integer NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (course_id, module_order)
);
COMMENT ON TABLE public.course_modules IS 'Stores modules or sections for each course.';

-- Lessons Table: Individual lessons within a module.
CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text,
    video_url text,
    lesson_order integer NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (module_id, lesson_order)
);
COMMENT ON TABLE public.lessons IS 'Individual lessons within a course module.';

-- Enrollments Table: Tracks user enrollments and progress.
CREATE TABLE public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    enrolled_at timestamptz DEFAULT now() NOT NULL,
    progress real DEFAULT 0.0,
    completed_at timestamptz,
    UNIQUE (user_id, course_id)
);
COMMENT ON TABLE public.enrollments IS 'Tracks user enrollments and progress in courses.';

-- Lesson Progress Table: Tracks a user's completion of individual lessons.
CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE CASCADE NOT NULL,
    lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamptz,
    UNIQUE (enrollment_id, lesson_id)
);
COMMENT ON TABLE public.lesson_progress IS 'Tracks completion status of individual lessons for an enrollment.';


-- 3. Indexes for Performance
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category);
CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);


-- 4. Row-Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies for `courses`
CREATE POLICY "Public can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Instructors can create courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update their own courses" ON public.courses FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete their own courses" ON public.courses FOR DELETE USING (auth.uid() = instructor_id);

-- Policies for `course_modules` and `lessons` (readable if user is enrolled)
CREATE POLICY "Enrolled users can view modules and lessons" ON public.course_modules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.course_id = course_modules.course_id
        AND enrollments.user_id = auth.uid()
    )
);
CREATE POLICY "Enrolled users can view modules and lessons" ON public.lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.enrollments en
        JOIN public.course_modules cm ON en.course_id = cm.course_id
        WHERE cm.id = lessons.module_id AND en.user_id = auth.uid()
    )
);
-- Add policies for module/lesson creation/update/deletion for instructors
CREATE POLICY "Instructors can manage their course modules" ON public.course_modules FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = course_modules.course_id
        AND courses.instructor_id = auth.uid()
    )
);
CREATE POLICY "Instructors can manage their course lessons" ON public.lessons FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        JOIN public.course_modules cm ON c.id = cm.course_id
        WHERE cm.id = lessons.module_id AND c.instructor_id = auth.uid()
    )
);


-- Policies for `enrollments`
CREATE POLICY "Users can view their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for `lesson_progress`
CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.enrollments
        WHERE enrollments.id = lesson_progress.enrollment_id
        AND enrollments.user_id = auth.uid()
    )
);


-- 5. Functions
-- Function to enroll a user in a course
CREATE OR REPLACE FUNCTION public.enroll_in_course(course_id_to_enroll uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_enrollment_id uuid;
BEGIN
  INSERT INTO public.enrollments (user_id, course_id)
  VALUES (auth.uid(), course_id_to_enroll)
  RETURNING id INTO new_enrollment_id;
  RETURN new_enrollment_id;
END;
$$;

-- Function to search for courses
CREATE OR REPLACE FUNCTION public.search_courses(search_term text)
RETURNS SETOF public.courses
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.courses
  WHERE
    is_published = true AND
    (
      title ILIKE '%' || search_term || '%' OR
      description ILIKE '%' || search_term || '%' OR
      category ILIKE '%' || search_term || '%'
    );
$$;

-- Function to update course progress automatically
CREATE OR REPLACE FUNCTION public.update_course_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_lessons INT;
    completed_lessons INT;
    enrollment_id_to_update uuid;
BEGIN
    -- Find the enrollment_id from the lesson_progress that was just changed
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        enrollment_id_to_update := NEW.enrollment_id;
    ELSIF TG_OP = 'DELETE' THEN
        enrollment_id_to_update := OLD.enrollment_id;
    END IF;

    -- Get the course_id from the enrollment
    DECLARE
        course_id_to_update uuid;
    BEGIN
        SELECT course_id INTO course_id_to_update FROM public.enrollments WHERE id = enrollment_id_to_update;

        -- Count total and completed lessons for the course
        SELECT
            COUNT(l.id),
            COUNT(lp.id) FILTER (WHERE lp.is_completed = true)
        INTO
            total_lessons,
            completed_lessons
        FROM public.lessons l
        JOIN public.course_modules cm ON l.module_id = cm.id
        LEFT JOIN public.lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = enrollment_id_to_update
        WHERE cm.course_id = course_id_to_update;

        -- Update the progress in the enrollments table
        IF total_lessons > 0 THEN
            UPDATE public.enrollments
            SET progress = (completed_lessons::real / total_lessons::real) * 100
            WHERE id = enrollment_id_to_update;
        ELSE
            UPDATE public.enrollments
            SET progress = 0
            WHERE id = enrollment_id_to_update;
        END IF;
    END;

    RETURN NULL; -- The result is ignored since this is an AFTER trigger
END;
$$;

-- 6. Triggers
-- Trigger to automatically update the `updated_at` timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_courses_updated
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_course_modules_updated
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_lessons_updated
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger to update overall course progress when a lesson is marked complete
CREATE TRIGGER on_lesson_progress_change
  AFTER INSERT OR UPDATE OR DELETE ON public.lesson_progress
  FOR EACH ROW EXECUTE PROCEDURE public.update_course_progress();

