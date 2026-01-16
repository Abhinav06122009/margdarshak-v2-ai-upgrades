
export interface Note {
  id: string;
  title: string;
  content?: string;
  folder: string;
  tags?: string[];
  is_highlighted: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  color?: string;
  word_count?: number;
  reading_time?: number;
  last_accessed?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotesProps {
  onBack: () => void;
}

export interface NoteFolder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  note_count?: number;
}

export interface NoteStats {
  total_notes: number;
  highlighted_notes: number;
  favorite_notes: number;
  total_word_count: number;
  total_reading_time: number;
  folders: string[];
  popular_tags: string[];
}

export interface SecureUser {
  id:string;
  email: string;
  profile?: {
    full_name: string;
    user_type: string;
    student_id?: string;
  };
}

export interface FormData {
  title: string;
  content: string;
  tags: string;
  folder: string;
  is_highlighted: boolean;
  is_favorite: boolean;
  color: string;
}
