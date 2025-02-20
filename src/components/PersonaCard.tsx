import React from 'react';
import { Plus, Shuffle, User, Star, RefreshCw } from 'lucide-react';
import { PersonaDetailsModal } from './PersonaDetailsModal';
import type { Persona } from '../types';

interface PersonaCardProps {
  persona?: Persona;
  isControlCard?: boolean;
  onRefresh?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onAdd?: () => void;
  onShuffle?: () => void;
  index?: number;
  viewMode: 'grid' | 'list';
}

export function PersonaCard({
  persona,
  isControlCard,
  onRefresh,
  onToggleLock,
  onAdd,
  onShuffle,
  index,
  viewMode
}: PersonaCardProps) {
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    if (chatContainerRef.current && persona?.messages?.length) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [persona?.messages]);

  if (isControlCard) {
    return (
      <div className={`persona-card flex ${viewMode === 'list' ? 'h-16' : 'flex-col h-full'} items-center justify-center gap-4 bg-white/5`}>
        <button
          onClick={onAdd}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
          title="Add Persona"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={onShuffle}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
          title="Shuffle Personas"
        >
          <Shuffle className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (!persona) return null;

  const cardContent = (
    <>
      <div className={`persona-header ${viewMode === 'list' ? 'mb-0 pb-0 border-0' : ''}`}>
        <div className="flex items-center gap-2">
          <img
            src={persona.avatar}
            alt={persona.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
          />
          <div>
            <h3 className="persona-name">{persona.name}</h3>
            <p className="persona-type">{persona.type}</p>
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
            onClick={() => onToggleLock?.(persona.id)}
            className={`transition-colors ${persona.isLocked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            title={persona.isLocked ? 'Unfavorite' : 'Favorite'}
          >
            <Star className="w-4 h-4" fill={persona.isLocked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={() => onRefresh?.(persona.id)}
            className={`transition-colors ${
              persona.isLocked 
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={persona.isLocked ? 'Cannot refresh favorited persona' : 'Refresh'}
            disabled={persona.isLocked}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {viewMode === 'grid' && (
        <div className="persona-content">
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
            {persona.description}
          </p>
          {persona.feedback && (
            <div className="mt-2 p-2 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">
                {persona.feedback}
              </p>
              {persona.timeElapsed && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Completed in {persona.timeElapsed}s
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <div 
        className={`persona-card ${
          viewMode === 'list' 
            ? 'flex items-center h-[68px] px-4 py-3 gap-4' 
            : 'flex flex-col h-full px-4 py-3'
        } ${
          persona.status === 'testing' ? 'animate-pulse' : ''
        }`}
        style={{
          animationDelay: `${index ? index * 0.1 : 0}s`,
        }}
      >
        {viewMode === 'list' ? (
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={persona.avatar}
                alt={persona.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h3 className="persona-name truncate">{persona.name}</h3>
                  <span className="persona-type text-xs truncate">({persona.type})</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {persona.description}
                </p>
              </div>
              {persona.status === 'completed' && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <span>Completed in {persona.timeElapsed}s</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setShowDetailsModal(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="View profile"
              >
                <User className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleLock?.(persona.id)}
                className={`transition-colors ${persona.isLocked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                title={persona.isLocked ? 'Unfavorite' : 'Favorite'}
              >
                <Star className="w-4 h-4" fill={persona.isLocked ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => onRefresh?.(persona.id)}
                className={`transition-colors ${
                  persona.isLocked 
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title={persona.isLocked ? 'Cannot refresh favorited persona' : 'Refresh'}
                disabled={persona.isLocked}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          cardContent
        )}
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