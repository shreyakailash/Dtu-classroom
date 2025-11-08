import React, { useState } from 'react';
import type { Screen, CalendarEvent, AttendanceRecord, Subject, Assignment } from './types';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/HomeScreen';
import SubjectsScreen from './components/SubjectsScreen';
import ChatbotScreen from './components/ChatbotScreen';
import ProfileScreen from './components/ProfileScreen';
import CalendarScreen from './components/CalendarScreen';
import AttendanceScreen from './components/AttendanceScreen';
import SubjectDetailScreen from './components/SubjectDetailScreen';
import AssignmentsScreen from './components/AssignmentsScreen';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('Home');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 1, title: 'Submit OS Assignment', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'deadline' },
    { id: 2, title: 'Mid-term exam prep', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'event' },
  ]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    { subjectCode: 'CO201', subjectName: 'Data Structures', attended: 18, total: 24 },
    { subjectCode: 'CO202', subjectName: 'Database Management Systems', attended: 20, total: 22 },
    { subjectCode: 'CO203', subjectName: 'Operating Systems', attended: 23, total: 24 },
    { subjectCode: 'IT201', subjectName: 'Software Engineering', attended: 15, total: 22 },
    { subjectCode: 'MA201', subjectName: 'Linear Algebra', attended: 22, total: 25 },
    { subjectCode: 'EC205', subjectName: 'Digital Electronics', attended: 19, total: 24 },
    { subjectCode: 'HU201', subjectName: 'Engineering Economics', attended: 16, total: 16 },
  ]);
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 1, title: 'Lab File Submission', subjectName: 'Operating Systems', subjectCode: 'CO203', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' },
    { id: 2, title: 'DBMS Project Report', subjectName: 'Database Management Systems', subjectCode: 'CO202', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' },
    { id: 3, title: 'Final SE Presentation', subjectName: 'Software Engineering', subjectCode: 'IT201', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'submitted' },
    { id: 4, title: 'Linear Algebra Problem Set 3', subjectName: 'Linear Algebra', subjectCode: 'MA201', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' },
  ]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setActiveScreen('SubjectDetail');
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen events={events} setActiveScreen={setActiveScreen} />;
      case 'Subjects':
        return <SubjectsScreen onSubjectSelect={handleSubjectSelect} />;
      case 'Calendar':
        return <CalendarScreen events={events} setEvents={setEvents} />;
      case 'Chatbot':
        return <ChatbotScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Attendance':
        return <AttendanceScreen attendance={attendance} setAttendance={setAttendance} />;
       case 'Assignments':
        return <AssignmentsScreen assignments={assignments} setAssignments={setAssignments} />;
      case 'SubjectDetail':
        return selectedSubject ? <SubjectDetailScreen subject={selectedSubject} onBack={() => setActiveScreen('Subjects')} /> : <SubjectsScreen onSubjectSelect={handleSubjectSelect} />;
      default:
        return <HomeScreen events={events} setActiveScreen={setActiveScreen} />;
    }
  };

  return (
    <div className="w-screen h-screen max-w-sm mx-auto bg-[#0C0C14] flex flex-col font-sans overflow-hidden shadow-2xl shadow-purple-900/50 rounded-lg">
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>
      {activeScreen !== 'SubjectDetail' && <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />}
    </div>
  );
};

export default App;