import React, { useState, useEffect, useRef } from 'react';
import type { CalendarEvent } from '../types';
import { parseEventFromPrompt } from '../services/geminiService';
import { SendIcon } from '../constants';

const getEventColor = (type: CalendarEvent['type']) => {
  switch(type) {
    case 'deadline': return 'bg-red-500';
    case 'event': return 'bg-blue-500';
    case 'reminder': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
}

const EventPopover: React.FC<{
  date: Date | null;
  events: CalendarEvent[];
  position: { top: number; left: number };
  onClose: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}> = ({ date, events, position, onClose, containerRef }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!date || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const popoverWidth = 256; // w-64
  
  let left = position.left - containerRect.left;
  let top = position.top - containerRect.top;

  // Adjust horizontal position to stay within the container
  if (left + popoverWidth / 2 > containerRect.width - 16) {
    left = containerRect.width - popoverWidth / 2 - 16;
  }
  if (left - popoverWidth / 2 < 16) {
    left = popoverWidth / 2 + 16;
  }

  const popoverStyle = {
    top: `${top}px`,
    left: `${left}px`,
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popover-title"
      style={popoverStyle}
      className="absolute z-50 w-64 bg-[#2a2a3e] rounded-lg shadow-xl p-4 border border-purple-800/50 transform -translate-x-1/2 translate-y-2"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 id="popover-title" className="font-bold text-white">
          Events for {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none" aria-label="Close">&times;</button>
      </div>
      <ul className="space-y-2">
        {events.map(event => (
          <li key={event.id} className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${getEventColor(event.type)} flex-shrink-0`}></div>
            <span className="text-gray-300">{event.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};


interface CalendarScreenProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ events, setEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const calendarDays: Date[] = [];
  const dayIterator = new Date(startOfMonth);
  dayIterator.setDate(dayIterator.getDate() - dayIterator.getDay());

  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(dayIterator));
    dayIterator.setDate(dayIterator.getDate() + 1);
  }
  
  const handlePrevMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(null);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const newEventData = await parseEventFromPrompt(prompt);
      if (newEventData && newEventData.date && newEventData.title) {
        const newEvent: CalendarEvent = {
          ...newEventData,
          id: Date.now(),
        };
        setEvents(prev => [...prev, newEvent].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setPrompt('');
      } else {
        setError("I couldn't understand that. Please try a different phrasing, like 'Submit physics homework on Oct 25'.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date: Date, eventsOnDay: CalendarEvent[], e: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedDate && selectedDate.getTime() === date.getTime()) {
      setSelectedDate(null);
      return;
    }
    if (eventsOnDay.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelectedDate(date);
      setPopoverPosition({
        top: rect.bottom,
        left: rect.left + rect.width / 2,
      });
    } else {
      setSelectedDate(null);
    }
  };
  
  const formatDateForComparison = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#0C0C14] text-white">
      <header className="p-4 text-center">
        <h1 className="text-xl font-bold">DTU Personal Calendar</h1>
      </header>

      <div ref={calendarContainerRef} className="flex-1 overflow-y-auto p-4 relative">
        <EventPopover
          date={selectedDate}
          events={events.filter(e => e.date === formatDateForComparison(selectedDate))}
          position={popoverPosition}
          onClose={() => setSelectedDate(null)}
          containerRef={calendarContainerRef}
        />
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-purple-900/50">&lt;</button>
          <h2 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-purple-900/50">&gt;</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {daysOfWeek.map(day => <div key={day} className="font-bold text-gray-400 text-xs">{day}</div>)}
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            
            const dayEvents = events.filter(e => e.date === dateStr);
            const isSelected = selectedDate?.getTime() === date.getTime();
            
            return (
              <button 
                key={index} 
                onClick={(e) => handleDateClick(date, dayEvents, e)}
                disabled={!isCurrentMonth}
                className={`relative h-16 flex flex-col items-center justify-start pt-1 rounded-lg transition-all duration-200 focus:outline-none ${isSelected ? 'bg-purple-800 ring-2 ring-purple-400' : (isCurrentMonth ? 'bg-[#161621] hover:bg-[#20202c]' : 'bg-[#161621]/30 cursor-default')}`}
                aria-haspopup={dayEvents.length > 0 ? "dialog" : undefined}
                aria-expanded={dayEvents.length > 0 ? isSelected : undefined}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-purple-600' : ''} ${!isCurrentMonth ? 'text-gray-600' : ''}`}>
                  {date.getDate()}
                </span>
                <div className="flex gap-1 mt-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type)}`} title={event.title}></div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t border-purple-900/50">
        <p className="text-xs text-gray-400 mb-2">Add to calendar: e.g., "Midterm exam on November 10"</p>
        <form onSubmit={handlePromptSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Add with AI..."
            className="flex-1 bg-[#161621] border border-purple-900/50 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? 
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
              <SendIcon className="w-6 h-6" />
            }
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default CalendarScreen;
