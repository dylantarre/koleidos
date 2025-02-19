import React from 'react';
import { X, User, Briefcase, MapPin, Target, AlertTriangle, Activity, Zap, Laptop, MessageSquare } from 'lucide-react';
import type { DetailedPersona } from '../types';

interface PersonaDetailsModalProps {
  persona: DetailedPersona;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonaDetailsModal({ persona, isOpen, onClose }: PersonaDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white dark:bg-darker-blue max-w-4xl w-full rounded-2xl shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-custom opacity-5" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={persona.avatar}
              alt={persona.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-white/10"
            />
            <div>
              <h2 className="text-2xl font-bold dark:text-white">{persona.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{persona.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Demographics
                </h3>
                <div className="space-y-2">
                  {persona.demographics.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong>{item.label}:</strong> {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  Goals
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {persona.goals.map((goal, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{goal}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Frustrations
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {persona.frustrations.map((frustration, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{frustration}</li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Behaviors
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {persona.behaviors.map((behavior, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{behavior}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Motivations
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {persona.motivations.map((motivation, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{motivation}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-500" />
                  Tech Proficiency
                </h3>
                <div className="space-y-3">
                  {Object.entries(persona.techProficiency).map(([level, description]) => (
                    <div key={level} className="flex items-start gap-2">
                      <span className="text-gray-700 dark:text-gray-300">
                        <strong className="capitalize">{level}:</strong> {description}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                  Preferred Channels
                </h3>
                <ul className="list-disc list-inside space-y-2">
                  {persona.preferredChannels.map((channel, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">{channel}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}