import React from 'react';
import type { Assignment } from '../types';

interface AssignmentsScreenProps {
    assignments: Assignment[];
    setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const formatDate = (dateString: string): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0,0,0,0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return "Overdue";
    } else if (diffDays === 0) {
        return "Due Today";
    } else if (diffDays === 1) {
        return "Due Tomorrow";
    } else {
        return `Due in ${diffDays} days`;
    }
};

const AssignmentCard: React.FC<{
    assignment: Assignment;
    onSubmit: (id: number) => void;
}> = ({ assignment, onSubmit }) => {

    const dueDateText = formatDate(assignment.dueDate);
    const isOverdue = dueDateText === "Overdue";

    return (
        <div className="bg-[#161621] p-4 rounded-lg flex items-center justify-between gap-4">
            <div className="flex-1">
                <p className="font-bold text-white">{assignment.title}</p>
                <p className="text-sm text-gray-400">{assignment.subjectName} ({assignment.subjectCode})</p>
                <p className={`text-xs mt-1 font-semibold ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`}>{dueDateText}</p>
            </div>
            {assignment.status === 'pending' ? (
                <button
                    onClick={() => onSubmit(assignment.id)}
                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                    Submit
                </button>
            ) : (
                <button
                    disabled
                    className="bg-green-600/50 text-white font-bold py-2 px-4 rounded-lg text-sm cursor-not-allowed flex items-center gap-1"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Submitted
                </button>
            )}
        </div>
    );
}

const AssignmentsScreen: React.FC<AssignmentsScreenProps> = ({ assignments, setAssignments }) => {

    const handleSubmit = (id: number) => {
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === id ? { ...assignment, status: 'submitted' } : assignment
            )
        );
    };

    const pendingAssignments = assignments.filter(a => a.status === 'pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const submittedAssignments = assignments.filter(a => a.status === 'submitted').sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    return (
        <div className="p-6 text-white bg-[#0C0C14] h-full">
            <h1 className="text-3xl font-bold mb-6">Assignments</h1>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3 border-b-2 border-purple-800/50 pb-2">Pending</h2>
                    {pendingAssignments.length > 0 ? (
                         <div className="space-y-3">
                            {pendingAssignments.map(assignment => (
                                <AssignmentCard key={assignment.id} assignment={assignment} onSubmit={handleSubmit} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm mt-4">No pending assignments. Great job!</p>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3 border-b-2 border-purple-800/50 pb-2">Completed</h2>
                     {submittedAssignments.length > 0 ? (
                        <div className="space-y-3 opacity-60">
                            {submittedAssignments.map(assignment => (
                                <AssignmentCard key={assignment.id} assignment={assignment} onSubmit={handleSubmit} />
                            ))}
                        </div>
                     ) : (
                        <p className="text-gray-500 text-sm mt-4">No assignments submitted yet.</p>
                     )}
                </section>
            </div>
        </div>
    );
};

export default AssignmentsScreen;