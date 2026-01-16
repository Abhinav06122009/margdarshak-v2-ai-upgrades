import React from 'react';
import { motion } from 'framer-motion';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Calendar, ChevronRight, Tag } from 'lucide-react';
import logo from "@/components/logo/logo.png";
import { Helmet } from "react-helmet-async";
import AdUnit from '@/components/AdUnit';

// ==================================================================================
// 8 HIGH-QUALITY, LONG-FORM BLOG POSTS (OPTIMIZED FOR ADSENSE)
// ==================================================================================

const BLOG_POSTS = [
  {
    id: 'scientific-study-techniques-2025',
    title: '5 Scientific Study Techniques That Actually Work in 2025',
    excerpt: 'Stop rereading your notes. Discover active recall, spaced repetition, and the Feynman technique to cut your study time in half while boosting retention.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 24, 2025',
    readTime: '8 min read',
    category: 'Study Hacks',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">We've all been there: staring at a textbook for hours, highlighting every other sentence, only to forget everything the next day. The problem isn't your brain; it's your method. Traditional studying methods like re-reading and highlighting are scientifically proven to be the least effective ways to learn.</p>
      
      <p class="mb-6">In 2025, successful students aren't studying harder; they are studying smarter using cognitive psychology. Here are the 5 methods backed by neuroscience that will revolutionize your GPA.</p>

      <h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">1. Active Recall: The Gold Standard</h2>
      <p class="mb-4">Most students study passively. They let information "wash over" them. Active recall involves retrieving information from your brain without looking at the answer. It strengthens neural pathways.</p>
      <p class="mb-4"><strong>How to apply it:</strong> Instead of reading your textbook chapter again, close the book and write down everything you remember. Then, open the book to fill in the gaps. This struggle to "retrieve" the memory is actually what encodes it into long-term storage.</p>

      <h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">2. Spaced Repetition</h2>
      <p class="mb-4">The "Forgetting Curve," discovered by Hermann Ebbinghaus, shows that we forget 50% of what we learn within an hour. Spaced Repetition Systems (SRS) combat this by forcing you to review material at the exact moment you are about to forget it.</p>
      <p class="mb-4"><strong>The Schedule:</strong> Review new material after 1 day, then 3 days, then 1 week, then 1 month. Apps like Anki automate this process, ensuring you never waste time studying what you already know.</p>

      <h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">3. The Feynman Technique</h2>
      <p class="mb-4">Named after Nobel prize-winning physicist Richard Feynman, this technique creates deep understanding. The core principle is simple: If you can't explain it simply to a child, you don't understand it.</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li><strong>Step 1:</strong> Write the concept name at the top of a page.</li>
        <li><strong>Step 2:</strong> Explain it in your own words as if teaching a 12-year-old. Avoid jargon.</li>
        <li><strong>Step 3:</strong> Identify gaps in your explanation and go back to the source material.</li>
        <li><strong>Step 4:</strong> Simplify and create analogies (e.g., describing "Voltage" as "water pressure").</li>
      </ul>

      <h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">4. Interleaved Practice</h2>
      <p class="mb-4">Blocked practice (doing 50 multiplication problems, then 50 division problems) feels productive but is deceptive. Interleaving involves mixing different types of problems.</p>
      <p class="mb-4">By mixing subjects or problem types, your brain has to constantly "reload" the strategy for each question. This cognitive effort feels harder but results in far superior test performance because it mimics the randomness of real exams.</p>

      <h2 class="text-2xl font-bold text-emerald-400 mt-8 mb-4">5. The Pomodoro Technique 2.0</h2>
      <p class="mb-4">Focus is a finite resource. The classic Pomodoro technique (25 minutes work, 5 minutes break) prevents mental fatigue.</p>
      <p class="mb-4"><strong>The 2025 Update:</strong> Recent studies suggest longer deep work sessions might be better for complex tasks. Try the 50/10 split: 50 minutes of intense, distraction-free work, followed by a 10-minute break where you <em>must</em> move your body (no scrolling social media).</p>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">Conclusion</h3>
      <p class="mb-4">Adopting these techniques requires effort. Active Recall feels harder than highlighting. Interleaving feels more confusing than blocked practice. But that "difficulty" is exactly what you need. Embrace the cognitive load, and your grades will follow.</p>
    `
  },
  {
    id: 'manage-exam-stress-guide',
    title: 'The Ultimate Guide to Managing Exam Stress',
    excerpt: 'Is anxiety hurting your grades? Learn actionable psychological strategies to turn panic into focus and perform your best under pressure.',
    image: 'https://images.unsplash.com/photo-1444653614773-995cb7542b30?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 20, 2025',
    readTime: '6 min read',
    category: 'Mental Health',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">Your hands are sweating. Your heart is racing. You stare at the first question, and your mind goes blank. This is the "Fight or Flight" response, and while it was great for running from tigers, it's terrible for Calculus exams.</p>
      
      <p class="mb-6">Stress shuts down the prefrontal cortex—the logical part of your brain responsible for memory and problem-solving. However, stress is also a biological tool. Here is how to harness it.</p>

      <h2 class="text-2xl font-bold text-blue-400 mt-8 mb-4">Physiological Hacks: Control the Body First</h2>
      <p class="mb-4">You cannot "think" your way out of a panic attack. You must use your body to signal safety to your brain.</p>
      
      <h3 class="text-lg font-bold text-white mt-4 mb-2">1. Box Breathing</h3>
      <p class="mb-4">Used by Navy SEALs to stay calm in combat, this technique resets your nervous system.</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li>Inhale for 4 seconds.</li>
        <li>Hold your breath for 4 seconds.</li>
        <li>Exhale for 4 seconds.</li>
        <li>Hold empty for 4 seconds.</li>
      </ul>
      <p class="mb-4">Repeat this cycle 4 times. It physically lowers cortisol levels within minutes.</p>

      <h2 class="text-2xl font-bold text-blue-400 mt-8 mb-4">Cognitive Reframing: Anxiety vs. Excitement</h2>
      <p class="mb-4">Did you know that the physiological symptoms of anxiety (racing heart, high energy) are identical to excitement? The only difference is your interpretation.</p>
      <p class="mb-4">Instead of saying "I am so nervous," tell yourself "I am excited to show what I know." This technique, called <em>anxiety reappraisal</em>, helps you channel that nervous energy into focus rather than fear.</p>

      <h2 class="text-2xl font-bold text-blue-400 mt-8 mb-4">Simulate the Environment</h2>
      <p class="mb-4">Context-dependent memory is real. If you study in your bed with music playing and snacks available, you will struggle to recall that information in a silent, cold exam hall.</p>
      <p class="mb-4"><strong>The Solution:</strong> Take at least one full practice exam under "Game Day" conditions. No phone. No music. Hard chair. Silence. This desensitizes your brain to the environment, so the only thing you have to worry about is the content.</p>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">Final Thoughts</h3>
      <p class="mb-4">Your worth is not defined by a test score. Paradoxically, truly accepting this fact is the best way to lower the stakes and perform better. Prepare hard, breathe deep, and trust your brain.</p>
    `
  },
  {
    id: 'digital-vs-paper-notes',
    title: 'Digital Notes vs. Paper: What Science Says',
    excerpt: 'Should you type or write? We analyze the cognitive benefits of both methods to help you build the perfect hybrid workflow.',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 15, 2025',
    readTime: '5 min read',
    category: 'Tech & Gear',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">The debate is endless: iPad or Notebook? Notion or Moleskine? While digital notes offer convenience, research suggests paper might still be king for learning.</p>

      <h2 class="text-2xl font-bold text-purple-400 mt-8 mb-4">The Case for Paper: Cognitive Processing</h2>
      <p class="mb-4">A landmark study titled "The Pen Is Mightier Than the Keyboard" found that students who took notes by hand performed significantly better on conceptual questions than those who typed.</p>
      <p class="mb-4"><strong>Why?</strong> Typing is too fast. When you type, you tend to transcribe the lecture verbatim without thinking. Handwriting is slow, which forces your brain to summarize and synthesize information <em>in real-time</em>. This synthesis is where learning happens.</p>

      <h2 class="text-2xl font-bold text-purple-400 mt-8 mb-4">The Case for Digital: Organization & Search</h2>
      <p class="mb-4">Paper notes have a major flaw: they are unsearchable. Six months later, finding that one specific formula in a stack of notebooks is impossible. Digital notes (using apps like Notion, Obsidian, or OneNote) are indexed, tagged, and backed up.</p>

      <h2 class="text-2xl font-bold text-purple-400 mt-8 mb-4">The Verdict: The Hybrid Method</h2>
      <p class="mb-4">You don't have to choose. The most successful students use a hybrid workflow:</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li><strong>During Class (Capture):</strong> Use paper. Prioritize understanding the concept and drawing diagrams. Don't worry about neatness.</li>
        <li><strong>After Class (Review & Storage):</strong> Transcribe your paper notes into your digital system. This acts as your first "Spaced Repetition" session and creates a permanent, searchable database of your knowledge.</li>
      </ul>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">Tools Recommendation</h3>
      <p class="mb-4">If you want the best of both worlds, consider a tablet with a stylus. Apps like GoodNotes allow you to handwrite (gaining the cognitive benefit) while keeping your notes digital and organized.</p>
    `
  },
  {
    id: 'how-to-create-study-schedule',
    title: 'How to Create a Study Schedule You Can Actually Stick To',
    excerpt: 'Stop making unrealistic plans. Learn how to use "Time Blocking" and "Buffer Zones" to manage your academic life without burnout.',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 10, 2025',
    readTime: '7 min read',
    category: 'Productivity',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">We have all made that schedule: "8:00 AM - Study Math. 9:00 AM - Study History. 10:00 AM - Write Essay." By 10:30 AM, you are behind, discouraged, and giving up. The problem isn't your discipline; it's your planning.</p>

      <h2 class="text-2xl font-bold text-orange-400 mt-8 mb-4">The Fallacy of Idealism</h2>
      <p class="mb-4">Most students plan for their "ideal self"—the robot who never gets tired, never gets hungry, and never gets interrupted. But you are human. A robust schedule accounts for chaos.</p>

      <h2 class="text-2xl font-bold text-orange-400 mt-8 mb-4">Core Principle 1: Time Blocking</h2>
      <p class="mb-4">Don't write a to-do list; put it on the calendar. A task without a time slot is just a wish. Assign every task a specific window of time. If it doesn't fit on the calendar, it won't get done.</p>

      <h2 class="text-2xl font-bold text-orange-400 mt-8 mb-4">Core Principle 2: The Buffer Zone</h2>
      <p class="mb-4">This is the secret sauce. For every 3 hours of work, schedule 1 hour of "Buffer Time."</p>
      <p class="mb-4"><strong>What is a Buffer?</strong> It is empty time reserved for the unexpected. Did the math assignment take twice as long? Use the buffer. Did your roommate need help? Use the buffer. If nothing goes wrong, congratulations—you have free time.</p>

      <h2 class="text-2xl font-bold text-orange-400 mt-8 mb-4">Core Principle 3: Energy Management</h2>
      <p class="mb-4">Not all hours are created equal. An hour of study at 9 AM is worth three hours of study at 11 PM.</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li><strong>Deep Work (High Energy):</strong> Schedule your hardest classes for your peak energy times (usually morning).</li>
        <li><strong>Shallow Work (Low Energy):</strong> Schedule emails, organizing notes, and errands for your energy slumps (usually mid-afternoon).</li>
      </ul>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">The MARGDARSHAK Way</h3>
      <p class="mb-4">Use the MARGDARSHAK calendar tool to color-code these blocks. Seeing your week visually helps you identify if you are overcommitting before the week even starts.</p>
    `
  },
  {
    id: 'grade-tracking-benefits',
    title: 'Why Tracking Your Grades is the Secret to a 4.0 GPA',
    excerpt: 'What gets measured gets managed. Discover how keeping a close eye on your weighted grades can help you prioritize assignments.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 05, 2025',
    readTime: '4 min read',
    category: 'Academic Success',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">Many students are afraid to look at their grades. They treat it like a bank account with a low balance—ignoring it and hoping for the best. This "Ostrich Strategy" is a recipe for disaster.</p>

      <h2 class="text-2xl font-bold text-pink-400 mt-8 mb-4">Data-Driven Decision Making</h2>
      <p class="mb-4">You have limited time. You cannot give 100% effort to every single assignment. Tracking your grades allows you to practice <strong>Strategic Allocation of Effort</strong>.</p>
      
      <p class="mb-4"><strong>Scenario:</strong> You have a Math test and a History paper due tomorrow.</p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li><strong>Math Grade:</strong> 98% (A)</li>
        <li><strong>History Grade:</strong> 89% (B+)</li>
      </ul>
      <p class="mb-4">Without data, you might split your time 50/50. With data, you see that you have a "safety buffer" in Math but are on the borderline in History. The smart move is to spend 80% of your time on History to secure the A, while doing just enough maintenance in Math.</p>

      <h2 class="text-2xl font-bold text-pink-400 mt-8 mb-4">Catching Errors Early</h2>
      <p class="mb-4">Professors make mistakes. TAs enter grades wrong. If you aren't tracking your own grades in a system like MARGDARSHAK, you won't notice that your "Final Project" was recorded as a 0 instead of a 100 until it is too late to fix it.</p>

      <h2 class="text-2xl font-bold text-pink-400 mt-8 mb-4">Motivation and Gamification</h2>
      <p class="mb-4">Seeing your GPA tick up from a 3.6 to a 3.7 provides a dopamine hit. It turns the abstract concept of "doing well" into a concrete metric you can influence. It gamifies your education.</p>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">Start Today</h3>
      <p class="mb-4">You don't need a complex spreadsheet. Use the MARGDARSHAK Grades module to input your syllabus weights and current scores. Knowledge is power.</p>
    `
  },
  {
    id: 'deep-work-for-students',
    title: 'The Power of Deep Work: Studying Less but Better',
    excerpt: 'Cal Newport’s concept of Deep Work changed the industry. Here is how students can apply it to finish homework in record time.',
    image: 'https://images.unsplash.com/photo-1497493292307-31c376b6e479?auto=format&fit=crop&q=80&w=1000',
    date: 'Oct 01, 2025',
    readTime: '6 min read',
    category: 'Productivity',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">In the age of TikTok and instant notifications, the ability to focus without distraction is becoming a superpower. This is what Cal Newport calls "Deep Work."</p>

      <h2 class="text-2xl font-bold text-indigo-400 mt-8 mb-4">The Productivity Equation</h2>
      <p class="mb-4">Newport proposes a simple formula:</p>
      <p class="text-xl font-mono bg-white/10 p-4 rounded text-center my-4">Work Produced = (Time Spent) x (Intensity of Focus)</p>
      <p class="mb-4">Most students have very low intensity. They study with their phone on the desk, checking notifications every 10 minutes. Because Intensity is low, Time Spent must be huge to get the work done.</p>
      <p class="mb-4">If you increase Intensity (by removing distractions), you can drastically reduce Time Spent. This is how some students get 4.0 GPAs while still partying on weekends.</p>

      <h2 class="text-2xl font-bold text-indigo-400 mt-8 mb-4">Attention Residue</h2>
      <p class="mb-4">When you switch from your essay to your phone and back, your brain doesn't switch instantly. A part of your attention remains "stuck" on the previous task (that funny meme you just saw). This is called Attention Residue.</p>
      <p class="mb-4">Even a quick check of your phone reduces your cognitive capacity for the next 20 minutes. To perform at an elite level, you must eliminate these "quick checks."</p>

      <h2 class="text-2xl font-bold text-indigo-400 mt-8 mb-4">How to Enter Deep Work</h2>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-gray-300">
        <li><strong>Ritualize It:</strong> Have a specific spot (library carrel) and a specific cue (noise-canceling headphones).</li>
        <li><strong>The Phone Jail:</strong> Your phone should not be in the same room. If it's visible, it drains willpower.</li>
        <li><strong>Embrace Boredom:</strong> Train your brain to be okay with lack of stimulation. Don't pull out your phone the second you are waiting in line for coffee.</li>
      </ul>
    `
  },
  {
    id: 'stop-procrastination-2-minute-rule',
    title: 'How to Stop Procrastinating: The 2-Minute Rule',
    excerpt: 'Struggling to start? This simple psychological trick will help you overcome the friction of starting difficult assignments.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000',
    date: 'Sep 28, 2025',
    readTime: '3 min read',
    category: 'Psychology',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">Procrastination isn't about laziness; it's about emotional regulation. We avoid tasks that make us feel anxious or incompetent. The solution is to lower the barrier to entry.</p>

      <h2 class="text-2xl font-bold text-red-400 mt-8 mb-4">The Physics of Productivity</h2>
      <p class="mb-4">Sir Isaac Newton taught us that an object at rest stays at rest. The hardest part of any workout is putting on your shoes. The hardest part of any essay is opening the document.</p>
      <p class="mb-4">Once you are in motion, staying in motion is easy. The goal, therefore, is simply to start.</p>

      <h2 class="text-2xl font-bold text-red-400 mt-8 mb-4">The 2-Minute Rule</h2>
      <p class="mb-4">The rule is simple: <strong>"If a task takes less than 2 minutes, do it right now."</strong></p>
      <p class="mb-4">But for students, there is a second version: <strong>"When starting a big habit, it should take less than 2 minutes to do."</strong></p>
      
      <p class="mb-4">Don't tell yourself "I need to study for 3 hours." That is scary. Tell yourself "I will open my textbook and read one page." That is easy. Anyone can do that.</p>
      <p class="mb-4">Usually, once you read that one page, the anxiety dissipates, and you naturally keep going. But you must give yourself permission to stop after 2 minutes. This removes the pressure.</p>

      <h3 class="text-xl font-bold text-white mt-8 mb-4">Implementation Strategy</h3>
      <p class="mb-4">Next time you are procrastinating on a paper, set a timer for 120 seconds. Your only goal is to write <em>something</em>—even if it's garbage—before the timer goes off. You'll be surprised how often you keep writing.</p>
    `
  },
  {
    id: 'sleep-hygiene-students',
    title: 'Why "Night Owls" Often Struggle (and How to Fix It)',
    excerpt: 'Sleep is when memory consolidation happens. If you are cutting sleep to study, you are actually learning less.',
    image: 'https://images.unsplash.com/photo-1541781777621-af2ea27520ce?auto=format&fit=crop&q=80&w=1000',
    date: 'Sep 20, 2025',
    readTime: '6 min read',
    category: 'Health',
    author: 'ABHINAV JHA',
    content: `
      <p class="lead text-xl text-gray-300 mb-6">The "all-nighter" is a badge of honor in college culture. It shouldn't be. Neuroscience tells us that pulling an all-nighter is essentially deleting the work you did the previous day.</p>

      <h2 class="text-2xl font-bold text-teal-400 mt-8 mb-4">The Role of the Hippocampus</h2>
      <p class="mb-4">Think of your hippocampus as a USB stick. It temporarily holds the information you learned today. During deep sleep, your brain transfers this data to the cortex (the hard drive) for long-term storage.</p>
      <p class="mb-4">If you don't sleep, the transfer never happens. The data is overwritten the next day. You literally cannot learn without sleep.</p>

      <h2 class="text-2xl font-bold text-teal-400 mt-8 mb-4">The 90-Minute Cycle</h2>
      <p class="mb-4">Sleep happens in cycles of roughly 90 minutes, moving from Light Sleep to Deep Sleep to REM and back. If you wake up in the middle of Deep Sleep (Stage 3), you will feel "sleep inertia"—that groggy, hit-by-a-truck feeling.</p>
      <p class="mb-4"><strong>The Hack:</strong> Try to sleep in multiples of 90 minutes. 
      <br/>- 6 Hours (4 cycles)
      <br/>- 7.5 Hours (5 cycles - Ideal for most)
      <br/>- 9 Hours (6 cycles)</p>

      <h2 class="text-2xl font-bold text-teal-400 mt-8 mb-4">Blue Light and Melatonin</h2>
      <p class="mb-4">Your screens emit blue light, which mimics the sun. This tricks your brain into thinking it's noon, suppressing melatonin production. Using your phone in bed literally prevents your brain from preparing for sleep.</p>
      <p class="mb-4"><strong>Solution:</strong> Use "Night Shift" mode on all devices after sunset, or better yet, ban screens from the bedroom entirely. Read a physical book for 30 minutes before sleep to signal to your body that the day is over.</p>
    `
  }
];

// ==================================================================================
// COMPONENT CODE
// ==================================================================================

const BlogList = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Helmet>
        <title>Blog | MARGDARSHAK - Student Productivity & Tips</title>
        <meta name="description" content="Read expert articles on study techniques, academic productivity, mental health, and student life hacks to help you succeed." />
      </Helmet>

      {/* Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-8 rounded" />
            <span className="font-bold text-xl tracking-tight">MARGDARSHAK <span className="text-emerald-400 font-light">Blog</span></span>
          </Link>
          <Link to="/auth">
            <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 transition-all">
              Student Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm text-emerald-400 mb-6 backdrop-blur-md">
            Academic Excellence & Productivity
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Insights for the Modern Student
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Expert advice on study techniques, academic productivity, mental health, and student life hacks to help you succeed.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6 pb-24">
        
        {/* ========================================================================= */}
        {/* ⚠️ ACTION REQUIRED: REPLACE 'YOUR_FEED_SLOT_ID' WITH REAL ID FROM ADSENSE */}
        {/* ========================================================================= */}
        <AdUnit slot="YOUR_FEED_SLOT_ID" className="mb-12" /> 

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }} // Faster stagger
              className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col h-full"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-60 z-10" />
                <img 
                  src={post.image} 
                  alt={post.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-xs text-white font-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-mono">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-400">{post.author}</span>
                  </div>
                  <Link to={`/blog/${post.id}`}>
                    <span className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors group/link">
                      Read <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <footer className="border-t border-white/10 py-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <img src={logo} alt="Logo" className="h-6 w-6 grayscale" />
          <span className="font-bold">MARGDARSHAK</span>
        </div>
        <p>© 2025 VSAV GYANTAPA. All rights reserved.</p>
      </footer>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.id === slug);

  if (!post) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4 text-emerald-500">404</h1>
      <p className="text-xl text-gray-400 mb-8">Article not found</p>
      <Link to="/blog">
        <Button variant="outline">Back to Blog</Button>
      </Link>
    </div>
  );

  // JSON-LD Structured Data for Article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "MARGDARSHAK",
      "logo": {
        "@type": "ImageObject",
        "url": "https://margdarshan.tech/logo.png"
      }
    },
    "datePublished": post.date,
    "description": post.excerpt
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Helmet>
        <title>{post.title} | MARGDARSHAK Blog</title>
        <meta name="description" content={post.excerpt} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 bg-emerald-500 z-[60]"
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={{ once: true }}
      />

      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 text-sm mb-6">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-medium">
              {post.category}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">{post.date}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-8 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-4 pb-8 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-900/20">
              {post.author.charAt(0)}
            </div>
            <div className="text-left">
              <div className="font-medium text-white">{post.author}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Author
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="mb-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/10">
          <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
        </div>

        {/* ========================================================================= */}
        {/* ⚠️ ACTION REQUIRED: REPLACE 'YOUR_TOP_SLOT_ID' WITH REAL ID FROM ADSENSE */}
        {/* ========================================================================= */}
        <AdUnit slot="YOUR_TOP_SLOT_ID" className="my-8" />

        {/* Article Body */}
        <div 
            className="prose prose-invert prose-lg prose-emerald max-w-none text-gray-300 leading-relaxed
            prose-headings:font-bold prose-headings:text-white
            prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:marker:text-emerald-500"
            dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* ============================================================================ */}
        {/* ⚠️ ACTION REQUIRED: REPLACE 'YOUR_BOTTOM_SLOT_ID' WITH REAL ID FROM ADSENSE */}
        {/* ============================================================================ */}
        <AdUnit slot="YOUR_BOTTOM_SLOT_ID" className="mt-16" />

        {/* CTA Bottom */}
        <div className="mt-12 pt-12 border-t border-white/10">
            <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-emerald-500/30 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3 text-white">Ready to improve your grades?</h3>
                  <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join thousands of students using MARGDARSHAK.</p>
                  <Link to="/auth">
                      <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 text-lg rounded-xl shadow-xl shadow-white/10 transform group-hover:scale-105 transition-all">
                          Get Started for Free
                      </Button>
                  </Link>
                </div>
            </div>
        </div>
      </article>
    </div>
  );
};

const BlogPage = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/:slug" element={<BlogPost />} />
    </Routes>
  );
};

export default BlogPage;
