import React, { useState } from 'react';
import type { Subject } from '../types';
import { generateSubjectNotes } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

// New interface for personal notes
interface PersonalNote {
    title: string;
    fileName: string;
}

// Mock data for personal notes, assuming these are user's uploaded files.
const personalNotes: Record<string, PersonalNote[]> = {
    'CO201': [
        { title: 'Lecture 1 - Big O Notation', fileName: 'ds_lec1_notes.pdf' },
        { title: 'Quick Sort vs Merge Sort', fileName: 'ds_sorting_comparison.pdf' },
    ],
    'CO203': [
        { title: 'Process Scheduling Algorithms', fileName: 'os_scheduling_notes.pdf' },
        { title: 'Memory Management Techniques', fileName: 'os_memory_mgmt.pdf' },
    ],
    'CO202': [
        { title: 'SQL Joins Explained', fileName: 'dbms_joins.pdf' },
    ],
    'IT201': [
        { title: 'Agile vs Waterfall', fileName: 'se_methodologies.pdf' },
        { title: 'UML Diagrams Guide', fileName: 'se_uml_guide.pdf' },
    ],
    'MA201': [],
    'EC205': [{title: "Karnaugh Maps", fileName: "k-maps.pdf"}],
    'HU201': [{title: "Supply and Demand Curves", fileName: "economics_basics.pdf"}],
};


interface SubjectDetailScreenProps {
    subject: Subject;
    onBack: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400">DTU-Bot is generating notes...</p>
    </div>
);

// Icon for PDF files
const FileTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const SubjectDetailScreen: React.FC<SubjectDetailScreenProps> = ({ subject, onBack }) => {
    const [notes, setNotes] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // Get personal notes for the current subject
    const subjectNotes = personalNotes[subject.code] || [];

    const handleGenerateNotes = async () => {
        setIsLoading(true);
        setNotes(null); // Clear previous notes if any
        const generatedNotes = await generateSubjectNotes(subject.name);
        setNotes(generatedNotes);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#0C0C14] text-white">
            <header className="flex items-center p-4 border-b border-purple-900/50">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-purple-900/50 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-center flex-1">{subject.name}</h1>
                 <div className="w-10"></div> {/* Spacer to balance the back button */}
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <LoadingSpinner />
                ) : notes !== null ? (
                    <div>
                         <button 
                            onClick={() => setNotes(null)} 
                            className="mb-4 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            Back to Options
                        </button>
                        <MarkdownRenderer content={notes} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-300 mb-3">AI Assistant</h2>
                            <button 
                                onClick={handleGenerateNotes}
                                className="w-full bg-purple-600/80 text-white font-bold py-4 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                                <span>Generate Study Notes</span>
                            </button>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold text-gray-300 mb-3">My Personal Notes</h2>
                            {subjectNotes.length > 0 ? (
                                <div className="space-y-3">
                                    {subjectNotes.map((note, index) => (
                                        <a href="#" key={index} className="flex items-center gap-4 bg-[#161621] p-4 rounded-lg hover:bg-purple-900/40 transition-colors">
                                            <FileTextIcon className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-white">{note.title}</p>
                                                <p className="text-xs text-gray-500">{note.fileName}</p>
                                            </div>
                                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 bg-[#161621] rounded-lg">
                                    <p className="text-gray-400">You haven't added any personal notes for this subject yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectDetailScreen;
