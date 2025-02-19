import React, { useState, useEffect } from 'react';
import { Bot, Plus, Shuffle, Moon, Sun, CheckCircle2, Loader2, Send, Menu, X, HelpCircle, Github, Settings, Users, UserCheck, Target } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { ChatInput } from './components/ChatInput';
import { PersonaCard } from './components/PersonaCard';
import { ChatMessage } from './components/ChatMessage';
import { TestReport } from './components/TestReport';
import type { Persona, TestReport as TestReportType } from './types';
import { isValidUrl, checkWebsiteAvailability } from './utils/url';
import { generatePersonas } from './lib/personaGenerator';

const emptyReport: TestReportType = {
  url: '',
  summary: '',
  successes: [],
  recommendations: [],
  commonIssues: [],
  overallScore: 0,
  completedTests: 0,
  totalTests: 0
};

function App() {
  const { user, profile, preferences, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isLogoInView, setIsLogoInView] = React.useState(true);
  const [shouldAnimateLogo, setShouldAnimateLogo] = React.useState(true);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLogoInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px'
      }
    );

    if (logoRef.current) {
      observer.observe(logoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TestReportType | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const reportContainerRef = React.useRef<HTMLDivElement>(null);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [urlInput, setUrlInput] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    content: string;
    sender: string;
    timestamp: number;
    avatar?: string;
  }>>([{
    id: 'initial',
    content: 'Enter a website URL above and I\'ll help test it with our personas.',
    sender: 'system',
    timestamp: Date.now(),
  }]);
  const [message, setMessage] = useState('');
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [personaType, setPersonaType] = useState<'random' | 'potential'>('random');

  // Reset state when URL changes
  useEffect(() => {
    // Reset chat messages to initial state
    setChatMessages([{
      id: 'initial',
      content: 'Enter a website URL above and I\'ll help test it with our personas.',
      sender: 'system',
      timestamp: Date.now(),
    }]);
    
    // Reset report and visibility
    setReport(null);
    setShowReport(false);
    setIsReportVisible(false);
    
    // Reset personas to initial state
    setPersonas([]);
  }, [urlInput]);

  useEffect(() => {
    const checkUrl = async () => {
      const url = urlInput.trim();
      if (!url || url.length < 3) {
        setIsUrlValid(false);
        return;
      }

      const currentUrl = url;

      try {
        const isValid = isValidUrl(url);
        if (!isValid) {
          setIsUrlValid(false);
          return;
        }

        if (currentUrl !== urlInput.trim()) return;
        setIsChecking(true);

        const isAvailable = await checkWebsiteAvailability(url);
        if (currentUrl !== urlInput.trim()) return;
        
        setIsUrlValid(isAvailable);
        
        if (isAvailable) {
          setIsLoading(true);
          
          // Update system message
          setChatMessages(prev => {
            const userMessages = prev.filter(msg => msg.sender === 'user');
            return [...userMessages, {
              id: Date.now().toString(),
              content: 'Generating personas...',
              sender: 'system',
              timestamp: Date.now(),
            }];
          });

          try {
            // Clear existing personas
            setPersonas([]);
            
            // Set up initial report
            setReport({ 
              ...emptyReport, 
              url, 
              totalTests: 5,
              successes: [],
              recommendations: [],
              commonIssues: []
            });

            // Create 5 placeholder personas first with stable IDs
            const placeholders = Array(5).fill(null).map((_, i) => ({
              id: `persona-${i + 1}`,
              name: `Persona ${i + 1}`,
              avatar: `/placeholder-avatar-${(i % 5) + 1}.png`,
              type: personaType === 'random' ? 'Random Users' : 'Targeted Users',
              description: 'Generating persona...',
              status: 'loading' as const,
              messages: [],
              isLocked: false,
              position: i // Add stable position index
            }));
            setPersonas(placeholders);
            
            // Generate personas progressively
            await generatePersonas(url, 5, (persona, index) => {
              setPersonas(prev => {
                const readyCount = prev.filter(p => p.status === 'idle').length + 1;
                if (readyCount === 5) {
                  setChatMessages(prev => {
                    const userMessages = prev.filter(msg => msg.sender === 'user');
                    return [...userMessages, {
                      id: Date.now().toString(),
                      content: 'All personas are ready! Click "Start Testing" to begin the analysis.',
                      sender: 'system',
                      timestamp: Date.now(),
                    }];
                  });
                }
                
                // Preserve the original ID and position from placeholders
                const updatedPersona = {
                  ...persona,
                  id: `persona-${index + 1}`,
                  position: index
                };
                
                return prev.map(p => p.id === updatedPersona.id ? updatedPersona : p)
                  .sort((a, b) => (a.position || 0) - (b.position || 0)); // Sort by position
              });
            }, personaType);
            
          } catch (error) {
            console.error('Error generating personas:', error);
            setChatMessages(prev => {
              const userMessages = prev.filter(msg => msg.sender === 'user');
              return [...userMessages, {
                id: Date.now().toString(),
                content: 'Sorry, there was an error generating personas. Please try again.',
                sender: 'system',
                timestamp: Date.now(),
              }];
            });
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        if (currentUrl !== urlInput.trim()) return;
        setIsUrlValid(false);
      } finally {
        if (currentUrl !== urlInput.trim()) return;
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [urlInput, personaType]);

  const getRandomUrl = () => {
    const urls = [
      // Dev & Tech Sites
      'github.com',
      'stackoverflow.com',
      'dev.to',
      'news.ycombinator.com',
      // Fun & Surprising Sites
      'neal.fun',
      'theuselessweb.com',
      'hackertyper.com',
      'pointerpointer.com',
      'howmanypeopleareinspacerightnow.com',
      'cat-bounce.com',
      'papertoilet.com',
      'omfgdogs.com',
      'thisisnotajumpscare.com',
      'findtheinvisiblecow.com',
      // Educational & Interesting
      'radiooooo.com',
      'archive.org',
      'musiclab.chromeexperiments.com',
      'stars.chromeexperiments.com',
      'quickdraw.withgoogle.com'
    ];
    return urls[Math.floor(Math.random() * urls.length)];
  };

  const handleRandomUrl = async () => {
    setIsRandomizing(true);
    const randomUrl = getRandomUrl();
    setUrlInput(randomUrl);
    
    // Wait for URL validation
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRandomizing(false);
  };

  const toggleLock = (id: string) => {
    setPersonas(current =>
      current.map(p => p.id === id ? { ...p, isLocked: !p.isLocked } : p)
    );
  };

  const shufflePersonas = () => {
    setPersonas(current => {
      const locked = current.filter(p => p.isLocked);
      const unlockedCount = current.filter(p => !p.isLocked).length;
      
      // Generate new personas for unlocked slots
      const newPersonas = Array(unlockedCount).fill(null).map(() => ({
        id: Date.now().toString() + Math.random(),
        name: `${[
          'Analytical Anna',
          'Digital David',
          'Mobile Maria',
          'Social Sophie',
          'Gaming Gary',
          'Remote Rachel',
          'Trendy Tyler',
          'Eco-conscious Emma',
          'Budget Brian',
          'Luxury Lisa'
        ][Math.floor(Math.random() * 10)]}`,
        avatar: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
        ][Math.floor(Math.random() * 7)],
        type: [
          'Digital Native',
          'Remote Worker',
          'Social Media Expert',
          'Mobile-First User',
          'Tech Enthusiast',
          'Casual Browser',
          'Power User'
        ][Math.floor(Math.random() * 7)],
        description: [
          'Expects seamless digital experiences across all devices',
          'Values efficiency and clear navigation in applications',
          'Highly engaged with social features and sharing capabilities',
          'Primarily accesses content through mobile devices',
          'Early adopter of new technologies and features',
          'Prefers simple and straightforward interfaces',
          'Looks for advanced features and customization options'
        ][Math.floor(Math.random() * 7)],
        status: 'idle' as const,
        isLocked: false
      }));
      
      return [...locked, ...newPersonas];
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    // Reset logo animation when theme changes
    setIsLogoInView(false);
    setShouldAnimateLogo(false);
    requestAnimationFrame(() => {
      setShouldAnimateLogo(true);
      setIsLogoInView(true);
    });
  }, [isDark]);

  const startTesting = async () => {
    if (!isUrlValid || !personas.length) return;
    
    setIsLoading(true);
    setChatMessages(prev => {
      const userMessages = prev.filter(msg => msg.sender === 'user');
      return [...userMessages, {
        id: Date.now().toString(),
        content: 'Testing in progress...',
        sender: 'system',
        timestamp: Date.now(),
      }];
    });

    // Update all personas to testing state
    setPersonas(current => 
      current.map(p => ({ ...p, status: 'testing' as const }))
    );

    // Run all persona tests simultaneously
    const testPromises = personas.map(async (persona) => {
      const startTime = Date.now();
      
      // Simulate test duration between 2-5 seconds
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      setPersonas(current =>
        current.map(p => p.id === persona.id ? {
          ...p,
          status: 'completed',
          feedback: `Found the website ${urlInput} to be quite interesting. The navigation could be improved...`,
          timeElapsed: parseFloat(timeElapsed)
        } : p)
      );

      setReport(current => 
        current ? { ...current, completedTests: current.completedTests + 1 } : null
      );
      
      return { personaId: persona.id, timeElapsed };
    });

    try {
      await Promise.all(testPromises);
      
      setReport(current => current ? {
        ...current,
        summary: 'Overall, the website shows promise but has several areas for improvement...',
        successes: [
          'Clean and modern design',
          'Fast loading times',
          'Mobile responsive layout'
        ],
        recommendations: [
          'Improve navigation structure',
          'Enhance mobile responsiveness',
          'Add more contrast to call-to-action buttons'
        ],
        commonIssues: [
          'Navigation is confusing for first-time users',
          'Mobile layout breaks on some devices',
          'Color contrast ratio doesn\'t meet WCAG standards'
        ],
        overallScore: 75
      } : null);

      setChatMessages(prev => {
        const userMessages = prev.filter(msg => msg.sender === 'user');
        return [...userMessages, {
          id: Date.now().toString(),
          content: `Testing complete! I've analyzed ${urlInput} with all personas. Would you like to view the detailed report?`,
          sender: 'system',
          timestamp: Date.now(),
        }];
      });
      
      setShowReport(true);
      setIsReportVisible(true);
      
      setTimeout(() => {
        reportContainerRef.current?.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 300);
    } catch (error) {
      console.error('Error during testing:', error);
      setChatMessages(prev => {
        const userMessages = prev.filter(msg => msg.sender === 'user');
        return [...userMessages, {
          id: Date.now().toString(),
          content: 'Sorry, there was an error testing the website. Please try again.',
          sender: 'system',
          timestamp: Date.now(),
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRandomPersona = () => {
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: 'New User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      type: 'General User',
      description: 'Average internet user with moderate technical skills',
      status: 'idle',
      isLocked: false
    };
    setPersonas(current => [...current, newPersona]);
  };

  const removePersona = (id: string) => {
    setPersonas(current => current.filter(p => p.id !== id));
  };

  const refreshPersona = (id: string) => {
    setPersonas(current => current.map(p => {
      if (p.id !== id) return p;
      
      return {
        ...p,
        name: [
          'Analytical Anna',
          'Digital David',
          'Mobile Maria',
          'Social Sophie',
          'Gaming Gary',
          'Remote Rachel',
          'Trendy Tyler',
          'Eco-conscious Emma',
          'Budget Brian',
          'Luxury Lisa'
        ][Math.floor(Math.random() * 10)],
        avatar: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6'
        ][Math.floor(Math.random() * 7)],
        type: [
          'Digital Native',
          'Remote Worker',
          'Social Media Expert',
          'Mobile-First User',
          'Tech Enthusiast',
          'Casual Browser',
          'Power User'
        ][Math.floor(Math.random() * 7)],
        description: [
          'Expects seamless digital experiences across all devices',
          'Values efficiency and clear navigation in applications',
          'Highly engaged with social features and sharing capabilities',
          'Primarily accesses content through mobile devices',
          'Early adopter of new technologies and features',
          'Prefers simple and straightforward interfaces',
          'Looks for advanced features and customization options'
        ][Math.floor(Math.random() * 7)],
        status: 'idle' as const,
        feedback: undefined,
        timeElapsed: undefined
      };
    }));
  };

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-dark-blue transition-colors overflow-x-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div ref={logoRef} className={`flex items-center gap-3 transition-all duration-700 ${
              isLogoInView && shouldAnimateLogo ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
            }`}>
              <div className="p-2 rounded-xl bg-gradient-custom shadow-glow bounce-hover">
                <Bot className="w-10 h-10 text-white bot-icon" />
              </div>
              <h1 className={`text-5xl text-gradient font-display tracking-wide font-[400] transition-all duration-1000 delay-300 ${
                isLogoInView && shouldAnimateLogo ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 -translate-x-8 blur-sm'
              }`}>
                koleidos
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDark(prev => !prev)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                  aria-label="Menu"
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-darker-blue/95 rounded-lg shadow-xl border border-gray-100 dark:border-white/10 backdrop-blur-sm z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-white/10">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {profile?.full_name || profile?.username}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                          onClick={async () => {
                            try {
                              await supabase.auth.signOut();
                            } catch (error) {
                              console.error('Error signing out:', error);
                            }
                            setIsMenuOpen(false);
                          }}
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                        onClick={() => {
                          setShowAuthModal(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        Sign In
                      </button>
                    )}
                    <a
                      href="https://github.com/dylantarre/koleidos"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Add settings functionality
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                      onClick={() => {
                        setIsMenuOpen(false);
                        // Add help functionality
                      }}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-2xl font-['Beiruti'] tracking-wide font-[300]">Instant Insights. Infinite Perspectives.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white dark:bg-darker-blue/50 rounded-lg shadow-md border border-gray-100 dark:border-white/10 flex-1 flex flex-col">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold dark:text-white">What site should we look at?</h2>
                  <button
                    onClick={handleRandomUrl}
                    disabled={isRandomizing}
                    className="px-3 py-2 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow"
                    title="Try a random URL"
                  >
                    <Shuffle className={`w-5 h-5 ${isRandomizing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-6">
                <div className="space-y-2">
                  <div className="relative flex gap-2 items-center">
                    <div className="flex-1 relative">
                      <input
                        id="website-url"
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Enter a website URL..."
                        className={`w-full px-4 py-2 bg-white/5 backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-2 text-black dark:text-white placeholder-gray-400 shadow-glow-lg transition-all pr-10 ${
                          urlInput.trim() === '' 
                            ? 'border-purple-400/80 border focus:ring-purple-500 dark:border-purple-500/50' 
                            : 'border-white/20 focus:ring-blue-500'
                        }`}
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isChecking ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : isUrlValid && (
                          <CheckCircle2 className="w-5 h-5 text-green-500 checkmark-glow" fill="currentColor" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setPersonaType(prev => prev === 'random' ? 'potential' : 'random')}
                      className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
                      title={`Currently: ${personaType === 'random' ? 'Random Users' : 'Targeted Users'} (click to switch)`}
                    >
                      {personaType === 'random' ? <Users className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </button>
                   
                  </div>
                  {isUrlValid && personas.length > 0 && (
                    <button
                      onClick={startTesting}
                      disabled={!personas.some(p => p.status === 'idle')}
                      className="w-full px-4 py-2 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow flex items-center justify-center gap-2"
                    >
                      <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : 'hidden'}`} />
                      Start Testing ({personas.filter(p => p.status === 'idle').length})
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col flex-1 mt-4 min-h-0">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {chatMessages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      content={msg.content}
                      sender={msg.sender}
                      avatar={msg.avatar}
                      onViewReport={() => setShowReport(!showReport)}
                    />
                  ))}
                </div>
                
                {urlInput.trim() !== '' && isUrlValid && report && (
                  <form className="sticky bottom-0 bg-white/5 backdrop-blur-sm border-t border-white/10"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!message.trim() || !isUrlValid || !report) return;

                      const userMessage = {
                        id: Date.now().toString(),
                        content: message,
                        sender: 'user',
                        timestamp: Date.now(),
                      };
                      
                      // Add user message to main chat
                      setChatMessages(prev => [...prev, userMessage]);
                      
                      let responseCount = 0;
                      const totalPersonas = personas.filter(p => p.status === 'idle' || p.status === 'completed').length;
                      const responses: string[] = [];

                      // Generate persona responses
                      personas.forEach(p => {
                        if (p.status === 'idle' || p.status === 'completed') {
                          setTimeout(() => {
                            const responseText = `As ${p.type}, I think ${message.trim().toLowerCase().startsWith('what') ? 'that ' : ''}${message}`;
                            const response = {
                              id: Date.now().toString() + Math.random(),
                              content: responseText,
                              messageType: 'persona',
                              timestamp: Date.now()
                            };
                            
                            // Update the persona's messages
                            setPersonas(prev =>
                              prev.map(persona =>
                                persona.id === p.id
                                  ? { 
                                      ...persona, 
                                      messages: [...(persona.messages || []), response]
                                    }
                                  : persona
                              )
                            );

                            responses.push(`${p.name}: ${responseText}`);
                            responseCount++;

                            // If all personas have responded, add summary to main chat
                            if (responseCount === totalPersonas) {
                              setChatMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                content: `Here's what our personas think:\n\n${responses.join('\n\n')}`,
                                sender: 'system',
                                timestamp: Date.now(),
                              }]);
                            }
                          }, 500 + Math.random() * 1500);
                        }
                      });

                      setMessage('');
                    }}
                  >
                    <div className="flex gap-2 p-4">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          isUrlValid 
                            ? report 
                              ? "Ask the personas a question..." 
                              : isLoading 
                                ? "Testing in progress..." 
                                : "Start testing to chat..."
                          : "Enter a website URL to start..."
                        }
                        disabled={!isUrlValid || !report}
                        className="flex-grow px-3 py-1.5 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={!message.trim() || !isUrlValid || !report}
                        className="px-3 py-1.5 bg-gradient-custom text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <div ref={reportContainerRef} className="overflow-visible">
              {urlInput.trim() === '' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-custom opacity-[0.02]" />
                  <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex justify-center mb-6">
                      <div className="grid grid-cols-3 gap-3 opacity-25">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-lg bg-white/10 animate-pulse"
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              opacity: 0.5 - (i * 0.05)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                      Meet Your Testing Team
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
                      Enter a website URL above to unlock your diverse team of personas. 
                      Each brings unique perspectives to test and evaluate your site.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['Power Users', 'Accessibility Needs', 'Mobile First', 'International', 'Senior Citizens'].map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full bg-white/5 text-sm text-gray-600 dark:text-gray-400 border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {urlInput.trim() !== '' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr pb-6">
                    {personas.map((persona, index) => {
                      const row = Math.floor(index / 2);
                      const col = index % 2;
                      return (
                        <PersonaCard
                          key={persona.id}
                          persona={persona}
                          onRemove={removePersona}
                          onRefresh={refreshPersona}
                          onToggleLock={toggleLock}
                          index={index}
                          gridPosition={{ row, col }}
                        />
                      );
                    })}
                    <PersonaCard
                      isControlCard
                      onAdd={addRandomPersona}
                      onShuffle={shufflePersonas}
                    />
                  </div>
                  
                  {report && showReport && (
                    <div ref={reportRef} className="mt-6">
                      <TestReport report={report} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default App;