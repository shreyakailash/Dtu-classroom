import React, { useState, useMemo } from 'react';
import type { AttendanceRecord } from '../types';
import { getAttendanceAdvice } from '../services/geminiService';
import { BotIcon, SendIcon } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

interface AttendanceScreenProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

type AttendanceStatus = 'attended' | 'missed' | 'bunk';

const AttendanceLogModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, AttendanceStatus>) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [updates, setUpdates] = useState<Record<string, AttendanceStatus>>({});
  
  // Hardcoded list of today's classes for the demo
  const todayClasses = ['CO201', 'CO203'];

  if (!isOpen) return null;
  
  const handleUpdate = (subjectCode: string, status: AttendanceStatus) => {
      setUpdates(prev => ({...prev, [subjectCode]: status}));
  };
  
  const handleSave = () => {
      onSave(updates);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161621] rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Log Today's Attendance</h2>
        <div className="space-y-3">
          {todayClasses.map(code => (
            <div key={code}>
              <p className="text-gray-300 mb-2">{code}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(code, 'attended')}
                  className={`flex-1 py-2 rounded text-xs transition-colors ${updates[code] === 'attended' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Attended
                </button>
                <button
                  onClick={() => handleUpdate(code, 'missed')}
                  className={`flex-1 py-2 rounded text-xs transition-colors ${updates[code] === 'missed' ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Missed
                </button>
                <button
                  onClick={() => handleUpdate(code, 'bunk')}
                  className={`flex-1 py-2 rounded text-xs transition-colors ${updates[code] === 'bunk' ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  Bunk
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="text-gray-400">Cancel</button>
          <button onClick={handleSave} className="bg-purple-600 px-4 py-2 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

const AttendanceScreen: React.FC<AttendanceScreenProps> = ({ attendance, setAttendance }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const overallStats = useMemo(() => {
    const totalAttended = attendance.reduce((sum, r) => sum + r.attended, 0);
    const totalClasses = attendance.reduce((sum, r) => sum + r.total, 0);
    if (totalClasses === 0) return { percent: 0, attended: 0, total: 0 };
    return {
      percent: Math.round((totalAttended / totalClasses) * 100),
      attended: totalAttended,
      total: totalClasses,
    };
  }, [attendance]);

  const getAttendanceColor = (percent: number) => {
    if (percent < 75) return 'text-red-400';
    if (percent < 80) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setAiResponse(null);
    try {
        const response = await getAttendanceAdvice(attendance, aiPrompt);
        setAiResponse(response);
    } catch (err) {
        setAiResponse("Sorry, an error occurred while getting advice.");
    } finally {
        setIsLoading(false);
        setAiPrompt('');
    }
  };
  
  const handleLogSave = (updates: Record<string, AttendanceStatus>) => {
    setAttendance(prev => prev.map(record => {
        const update = updates[record.subjectCode];
        if (update === 'attended') {
            return { ...record, attended: record.attended + 1, total: record.total + 1 };
        }
        if (update === 'missed') {
            return { ...record, total: record.total + 1 };
        }
        // If the update is 'bunk', neither attended nor total classes change.
        // Therefore, we just return the original record without modification.
        return record;
    }));
  };

  const conicGradient = `radial-gradient(closest-side, #0C0C14 79%, transparent 80% 100%), conic-gradient(#4f46e5 ${overallStats.percent}%, #333 0)`;

  return (
    <div className="flex flex-col h-full bg-[#0C0C14] text-white">
      <AttendanceLogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleLogSave} />
      <header className="p-4 text-center">
        <h1 className="text-xl font-bold">Attendance Tracker</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Overall Stats */}
        <section className="flex flex-col items-center gap-4 bg-[#161621] p-6 rounded-xl">
          <div style={{background: conicGradient}} className="w-32 h-32 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold">{overallStats.percent}%</span>
          </div>
          <p className="font-semibold text-lg">Overall Attendance</p>
          <p className="text-sm text-gray-400">{overallStats.attended} / {overallStats.total} Classes Attended</p>
           <button onClick={() => setIsModalOpen(true)} className="w-full bg-purple-600/80 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Log Today's Attendance
          </button>
        </section>

        {/* Subject-wise List */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Subjects</h2>
          <div className="space-y-2">
            {attendance.map(record => {
              const percent = record.total > 0 ? Math.round((record.attended / record.total) * 100) : 0;
              return (
                <div key={record.subjectCode} className="bg-[#161621] p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{record.subjectName}</span>
                    <span className={`font-semibold ${getAttendanceColor(percent)}`}>{percent}%</span>
                  </div>
                  <div className="text-xs text-gray-400 flex justify-between items-center">
                    <span>{record.attended}/{record.total} classes</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div className={`${getAttendanceColor(percent).replace('text', 'bg')}`} style={{ width: `${percent}%`, height: '100%', borderRadius: 'inherit' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* AI Helper Form */}
      <div className="p-4 border-t border-purple-900/50 space-y-3">
        {aiResponse && (
            <div className="flex items-start gap-2 bg-[#161621] p-3 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <BotIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm flex-1">
                    <MarkdownRenderer content={aiResponse} />
                </div>
            </div>
        )}
         {isLoading && !aiResponse && (
            <div className="text-center text-sm text-gray-400">DTU-Bot is thinking...</div>
        )}
        <form onSubmit={handleAiSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI for attendance advice..."
            className="flex-1 bg-[#161621] border border-purple-900/50 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
            disabled={isLoading || !aiPrompt.trim()}
          >
            {isLoading ? 
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
              <SendIcon className="w-6 h-6" />
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttendanceScreen;