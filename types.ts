export type Screen = 'Home' | 'Subjects' | 'Calendar' | 'Chatbot' | 'Profile' | 'Attendance' | 'SubjectDetail' | 'Assignments';

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  sources?: GroundingSource[];
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD format
  type: 'event' | 'deadline' | 'reminder';
}

export interface AttendanceRecord {
  subjectCode: string;
  subjectName: string;
  attended: number;
  total: number;
}

export interface Subject {
    code: string;
    name: string;
}

export interface Assignment {
  id: number;
  title: string;
  subjectName: string;
  subjectCode: string;
  dueDate: string; // YYYY-MM-DD
  status: 'pending' | 'submitted';
}