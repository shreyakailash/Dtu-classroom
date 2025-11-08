
import React, { useState, useRef, useEffect } from 'react';
import { runChatStream } from '../services/geminiService';
import type { Message } from '../types';
import { SendIcon, BotIcon } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm DTU-Bot. I can now search the official DTU website for you. How can I help?",
      sender: 'ai',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    const aiMessage: Message = {
      id: Date.now() + 1,
      text: '',
      sender: 'ai',
      sources: [],
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const stream = runChatStream(input);
        for await (const chunk of stream) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === aiMessage.id) {
                    const newText = msg.text + (chunk.text || '');
                    
                    const existingSources = new Map((msg.sources || []).map(s => [s.uri, s]));
                    if (chunk.sources) {
                        chunk.sources.forEach(s => existingSources.set(s.uri, s));
                    }
                    const newSources = Array.from(existingSources.values());

                    return { ...msg, text: newText, sources: newSources };
                }
                return msg;
            }));
        }
    } catch (error) {
        console.error("Failed to get response from Gemini", error);
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessage.id 
            ? { ...msg, text: "Sorry, I couldn't get a response. Please check your connection and API key." } 
            : msg
        ));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0C0C14] text-white">
      <header className="p-4 border-b border-purple-900/50 text-center">
        <h1 className="text-xl font-bold">DTU-Bot Assistant</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-purple-600 rounded-br-none'
                  : 'bg-[#161621] rounded-bl-none'
              }`}
            >
              {message.sender === 'ai' ? (
                <div className="text-sm">
                    <MarkdownRenderer content={message.text} />
                    {isLoading && message.id === messages[messages.length - 1].id && (
                      <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />
                    )}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              )}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-800/50">
                    <h4 className="text-xs font-bold text-gray-400 mb-1">Sources:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                        {message.sources.map((source, index) => (
                            <li key={index} className="text-xs truncate">
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-purple-300 hover:underline"
                                    title={source.title}
                                >
                                    {source.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
              )}
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-purple-900/50">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about syllabus, notices..."
            className="flex-1 bg-[#161621] border border-purple-900/50 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed"
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotScreen;