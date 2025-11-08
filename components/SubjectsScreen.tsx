import React from 'react';
import type { Subject } from '../types';

const subjects: Subject[] = [
    { code: 'CO201', name: 'Data Structures' },
    { code: 'CO202', name: 'Database Management Systems' },
    { code: 'CO203', name: 'Operating Systems' },
    { code: 'IT201', name: 'Software Engineering' },
    { code: 'MA201', name: 'Linear Algebra' },
    { code: 'EC205', name: 'Digital Electronics' },
    { code: 'HU201', name: 'Engineering Economics' },
];

interface SubjectCardProps {
    code: string;
    name: string;
    index: number;
    onClick: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ code, name, index, onClick }) => {
    const colors = ['bg-purple-600/80', 'bg-blue-600/80', 'bg-green-600/80', 'bg-red-600/80', 'bg-yellow-600/80'];
    const colorClass = colors[index % colors.length];

    return (
        <button 
            onClick={onClick}
            className={`p-5 rounded-xl shadow-lg ${colorClass} text-white text-left w-full transition-transform transform hover:scale-105 active:scale-100`}
        >
            <p className="text-sm font-semibold opacity-80">{code}</p>
            <h3 className="text-xl font-bold mt-1">{name}</h3>
        </button>
    );
};

interface SubjectsScreenProps {
    onSubjectSelect: (subject: Subject) => void;
}

const SubjectsScreen: React.FC<SubjectsScreenProps> = ({ onSubjectSelect }) => {
    return (
        <div className="p-6 text-white bg-[#0C0C14] h-full">
            <h1 className="text-3xl font-bold mb-6">My Subjects</h1>
            <div className="space-y-4">
                {subjects.map((subject, index) => (
                    <SubjectCard 
                        key={subject.code} 
                        code={subject.code} 
                        name={subject.name} 
                        index={index}
                        onClick={() => onSubjectSelect(subject)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default SubjectsScreen;