import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface SubscriptionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionPopup({ isOpen, onClose }: SubscriptionPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-darker-blue max-w-md w-full rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-custom opacity-5" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 relative">
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-custom shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">
            Unlock Custom Personas
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Create unlimited custom personas and get detailed insights with our Pro plan.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Unlimited custom personas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Advanced persona templates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">✓</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">Detailed testing insights</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-lg bg-gradient-custom text-white font-semibold hover:opacity-90 transition-opacity shadow-glow"
          >
            Upgrade to Pro
          </button>
          
          <button
            onClick={onClose}
            className="w-full mt-2 py-2 px-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Maybe later
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
            Starting at $19/month
          </p>
        </div>
      </div>
    </div>
  );
}