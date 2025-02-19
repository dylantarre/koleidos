import React from 'react';
import { CheckCircle2, Loader2, Plus, Shuffle, Star, Send, User, Lock, Unlock, RefreshCw, X } from 'lucide-react';
import { SubscriptionPopup } from './SubscriptionPopup';
import { PersonaDetailsModal } from './PersonaDetailsModal';
import type { Persona } from '../types';

interface PersonaCardProps {
  persona?: Persona;
  onRemove?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  isControlCard?: boolean;
  onAdd?: () => void;
  onShuffle?: () => void;
  index?: number;
  gridPosition?: { row: number; col: number };
}

export function PersonaCard({ persona, onRemove, onRefresh, onToggleLock, isControlCard, onAdd, onShuffle, index = 0, gridPosition }: PersonaCardProps) {
  const [showSubscriptionPopup, setShowSubscriptionPopup] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [isNew, setIsNew] = React.useState(true);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsNew(true);
    const totalPersonas = 5; // Base number of personas
    const baseDelay = 100;
    const staggerDelay = 80;
    const reverseIndex = totalPersonas - (index ?? 0);
    const timer = setTimeout(() => setIsNew(false), baseDelay + (reverseIndex * staggerDelay));
    return () => clearTimeout(timer);
  }, [persona?.id, index]);

  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    if (chatContainerRef.current && persona?.messages?.length) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [persona?.messages]);

  if (isControlCard && onAdd && onShuffle) {
    return (
      <>
        <div ref={cardRef} className="bg-white dark:bg-darker-blue/50 rounded-lg shadow-md border border-gray-100 dark:border-white/10 p-4 flex flex-col h-[200px]">
          <h3 className="font-semibold text-sm dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-white/10">Persona Controls</h3>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <button
              onClick={() => setShowSubscriptionPopup(true)}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-white/10 hover:shadow-glow transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Add New Persona
              </span>
            </button>
          
            <button
              onClick={onShuffle}
              className="flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-white/10 hover:shadow-glow transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-custom flex items-center justify-center">
                <Shuffle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                New Personas
              </span>
            </button>
          </div>
        </div>
        <SubscriptionPopup
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
        />
      </>
    );
  }

  if (!persona) return null;

  const isLoading = persona.status === 'loading';

  return (
    <>
    <div 
      className={`persona-card h-[200px] flex flex-col relative ${isNew ? 'animate-slide-in' : ''} ${
        isLoading ? 'animate-pulse' : ''
      }`}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="persona-header">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
            {isLoading ? (
              <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse" />
            ) : (
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            )}
          </div>
          <div>
            <h3 className="persona-name">{persona.name}</h3>
            <span className="persona-type">{persona.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetailsModal(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="View profile"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            className="favorite-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock?.(persona.id);
            }}
            title={persona.isLocked ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-4 h-4 ${persona.isLocked ? 'text-yellow-400 star-glow fill-current' : ''}`} />
          </button>
        </div>
      </div>
      <div className="persona-content flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent" ref={chatContainerRef}>
        <div className="flex items-start gap-3">
          <div className="bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg p-2 max-w-[90%] text-sm">
            <span className="line-clamp-2">{persona.description}</span>
          </div>
        </div>        
        {persona.status === 'testing' && (
          <div className="flex items-start gap-3">
            <div className="bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg p-2 max-w-[90%] flex items-center gap-1.5 text-sm">
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
              Testing your website...
            </div>
          </div>
        )}        
        {persona.status === 'completed' && (
          <>
            <div className="flex items-start gap-3">
              <div className="bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-lg p-2 max-w-[90%] text-sm">
                <div className="flex items-center gap-1.5 text-green-500 mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Testing completed in {persona.timeElapsed}s
                </div>
                {persona.feedback}
              </div>
            </div>
            
            {persona.messages?.map(msg => (
              msg.sender === 'persona' ? (
                <div key={msg.id} className="flex items-start gap-2 px-2">
                  <div className="rounded-lg p-2 w-full text-sm bg-white/5 backdrop-blur-sm text-gray-700 dark:text-gray-300">
                    <div className="text-xs text-blue-500 dark:text-blue-400">{persona.name}</div>
                    {msg.content}
                  </div>
                </div>
              ) : null
            ))}
            <div ref={chatEndRef} className="h-0" />
          </>
        )}
      </div>
      
    </div>
    <PersonaDetailsModal
      persona={{
        ...persona,
        demographics: [
          { label: 'Age', value: '28' },
          { label: 'Location', value: 'San Francisco, CA' },
          { label: 'Occupation', value: 'UX Designer' },
          { label: 'Education', value: "Bachelor's in HCI" }
        ],
        goals: [
          'Create intuitive user experiences',
          'Stay updated with latest design trends',
          'Collaborate effectively with developers'
        ],
        frustrations: [
          'Complex technical documentation',
          'Lack of design system consistency',
          'Limited user research resources'
        ],
        behaviors: [
          'Regularly participates in design workshops',
          'Active in online UX communities',
          'Conducts informal user testing sessions'
        ],
        motivations: [
          'Passion for solving user problems',
          'Drive to create accessible designs',
          'Interest in emerging technologies'
        ],
        techProficiency: {
          high: 'Design tools (Figma, Sketch)',
          moderate: 'Frontend development',
          low: 'Backend systems'
        },
        preferredChannels: [
          'Design blogs and forums',
          'Professional social networks',
          'Industry conferences and meetups'
        ]
      }}
      isOpen={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
    />
    </>
  );
}