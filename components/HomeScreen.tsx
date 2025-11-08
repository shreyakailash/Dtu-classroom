import React from 'react';
import { UserIcon } from '../constants';
import type { CalendarEvent, Screen } from '../types';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);


const QuickActionCard: React.FC<{icon: React.ReactNode; label: string; onClick: () => void;}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 bg-purple-900/20 rounded-xl p-4 text-center hover:bg-purple-900/40 transition-colors duration-200">
        <div className="bg-purple-500/30 p-3 rounded-full">{icon}</div>
        <span className="text-xs text-gray-300 font-medium">{label}</span>
    </button>
);

interface HomeScreenProps {
  events: CalendarEvent[];
  setActiveScreen: (screen: Screen) => void;
}


const HomeScreen: React.FC<HomeScreenProps> = ({ events, setActiveScreen }) => {
    const upcomingDeadlines = events
        .filter(event => event.type === 'deadline' && new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 2);

    return (
        <div className="p-6 text-white bg-[#0C0C14] space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <p className="text-gray-400 text-sm">Hello,</p>
                    <h1 className="text-2xl font-bold">Jyoti!</h1>
                </div>
                <div className="flex items-center gap-4">
                    <BellIcon />
                    <img src="https://picsum.photos/seed/jyoti/40/40" alt="Profile" className="w-10 h-10 rounded-full border-2 border-purple-500" />
                </div>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for lectures, notes..."
                    className="w-full bg-[#161621] border border-purple-900/50 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon />
                </div>
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-4 gap-4">
                    <QuickActionCard icon={<UserIcon className="w-6 h-6 text-purple-300"/>} label="My Subjects" onClick={() => setActiveScreen('Subjects')} />
                    <QuickActionCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-300"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} label="Timetable" onClick={() => setActiveScreen('Calendar')} />
                    <QuickActionCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>} label="Assignments" onClick={() => setActiveScreen('Assignments')} />
                    <QuickActionCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-300"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} label="Attendance" onClick={() => setActiveScreen('Attendance')} />
                </div>
            </section>
            
            {/* Today's Timetable */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Today's Timetable</h2>
                <div className="space-y-3">
                    <div className="bg-[#161621] p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold">Data Structures</p>
                            <p className="text-sm text-gray-400">CO201 | 9:00 AM - 10:00 AM</p>
                        </div>
                        <span className="text-purple-400 font-semibold">Lecture Hall 5</span>
                    </div>
                    <div className="bg-[#161621] p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-bold">Operating Systems</p>
                            <p className="text-sm text-gray-400">CO203 | 11:00 AM - 12:00 PM</p>
                        </div>
                        <span className="text-purple-400 font-semibold">Lab 3</span>
                    </div>
                </div>
            </section>

             {/* Upcoming Deadlines */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Upcoming Deadlines</h2>
                <div className="space-y-3">
                    {upcomingDeadlines.length > 0 ? (
                        upcomingDeadlines.map(event => (
                            <div key={event.id} className="bg-[#161621] p-4 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{event.title}</p>
                                    <p className="text-sm text-gray-400">
                                        Due: {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <span className="text-red-400 font-semibold">Reminder</span>
                            </div>
                        ))
                    ) : (
                        <div className="bg-[#161621] p-4 rounded-lg text-center">
                            <p className="text-gray-400">No deadlines coming up. You're all clear!</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomeScreen;