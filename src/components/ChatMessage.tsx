import React from 'react';
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  sender: string;
  avatar?: string;
  onViewReport?: () => void;
}

export function ChatMessage({ content, sender, avatar, onViewReport }: ChatMessageProps) {
  // Check if this is the completion message
  const isCompletionMessage = content.includes('Testing complete!');
  
  return (
    <div className={`flex items-start gap-3 ${
      sender === 'user' ? 'flex-row-reverse' : ''
    }`}>
      {sender === 'system' ? (
        <Bot className="w-6 h-6 text-blue-500 mt-1" />
      ) : sender !== 'user' && avatar && (
        <img
          src={avatar}
          alt={sender}
          className="w-6 h-6 rounded-full object-cover ring-2 ring-white/10"
        />
      )}
      <div className={`rounded-lg p-3 max-w-[80%] ${
        sender === 'user'
          ? 'bg-gradient-custom text-white'
          : 'bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300'
      }`}
    >
      {isCompletionMessage && onViewReport ? (
        <div className="space-y-1">
          <div>Testing complete! I've analyzed <strong>{content.split(' ').slice(4, -11).join(' ')}</strong> with all personas.</div>
          <div className="mt-2">
            Would you like to{' '}
            <button
              onClick={onViewReport}
              className="text-blue-400 hover:text-blue-300 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-transparent rounded px-1 -mx-1"
            >
              view the detailed report
            </button>
            ?
          </div>
        </div>
      ) : (
        content
      )}
      </div>
    </div>
  );
}