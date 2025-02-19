import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { normalizeUrl } from '../utils/url';

interface ChatInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (input.trim() && !isLoading) {
      try {
        const normalizedUrl = normalizeUrl(input.trim());
        onSubmit(normalizedUrl);
        setInput('');
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter a URL or ask a question..."
            className={`flex-1 px-4 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 ${
              error ? 'border-red-500 dark:border-red-500' : ''
            }`}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}