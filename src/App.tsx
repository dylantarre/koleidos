import React, { useState, useEffect } from 'react';
import { Bot, Shuffle, Moon, Sun, CheckCircle2, Loader2, Send, Menu, X, HelpCircle, Github, Settings, Users, Target, LayoutGrid, List } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { PersonaCard } from './components/PersonaCard';
import { ChatMessage } from './components/ChatMessage';
import { TestReport } from './components/TestReport';
import type { Persona, TestReport as TestReportType } from './types';
import { isValidUrl, checkWebsiteAvailability } from './utils/url';
import { generatePersonas, fetchPersonas, fetchRandomPersona, generatePlaceholderPersona } from './lib/personaGenerator';

function App() {
  const { user, profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [isLogoInView, setIsLogoInView] = React.useState(true);
  const [shouldAnimateLogo, setShouldAnimateLogo] = React.useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<TestReportType | null>(null);
  const [showReport, setShowReport] = useState(false);
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
  const [personaType, setPersonaType] = useState<'random' | 'potential'>('random');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [shouldGeneratePersonas, setShouldGeneratePersonas] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

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
    
    // Reset personas to initial state
    setPersonas([]);
    setShouldGeneratePersonas(true); // Trigger persona generation
  }, [urlInput]);

  const checkUrl = async () => {
    const url = urlInput.trim();
    if (!url || url.length < 3) {
      setIsUrlValid(false);
      return;
    }

    try {
      const isValid = isValidUrl(url);
      if (!isValid) {
        setIsUrlValid(false);
        return;
      }

      setIsChecking(true);
      const isAvailable = await checkWebsiteAvailability(url);
      setIsUrlValid(isAvailable);
      
      if (isAvailable) {
        setIsLoading(true);
        
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
          setPersonas(generatePersonas(5));
          
          setChatMessages(prev => {
            const userMessages = prev.filter(msg => msg.sender === 'user');
            return [...userMessages, {
              id: Date.now().toString(),
              content: 'All personas are ready! Click "Start Testing" to begin the analysis.',
              sender: 'system',
              timestamp: Date.now(),
            }];
          });
        } catch {
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
    } catch {
      setIsUrlValid(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(checkUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [urlInput]);

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

  const refreshPersona = async (id: string) => {
    setPersonas((prev) => {
      return prev.map((p) => {
        if (p.id === id) {
          const loadingPersona: Persona = {
            ...p,
            status: 'loading',
            name: 'Loading...',
            description: 'Fetching new persona...',
            avatar: '/placeholder-avatar.png',
          };
          return loadingPersona;
        }
        return p;
      });
    });

    try {
      const newPersona = await fetchRandomPersona();
      
      setPersonas((prev) => {
        return prev.map((p) => {
          if (p.id === id) {
            const updatedPersona: Persona = {
              ...p,
              ...newPersona,
              id: id, // Keep the original ID
              isLocked: false,
              status: 'idle',
            };
            return updatedPersona;
          }
          return p;
        });
      });
    } catch (_err) {
      // If API fails, use placeholder
      const placeholder = generatePlaceholderPersona(Math.floor(Math.random() * 8));
      
      setPersonas((prev) => {
        return prev.map((p) => {
          if (p.id === id) {
            const updatedPersona: Persona = {
              ...p,
              ...placeholder,
              id: id, // Keep the original ID
              isLocked: false,
              status: 'idle',
            };
            return updatedPersona;
          }
          return p;
        });
      });
    }
  };

  const shufflePersonas = async () => {
    // Count how many personas are not locked
    const unlockedCount = personas.filter(p => !p.isLocked).length;
    
    // Set all unlocked personas to loading state
    setPersonas(prev => prev.map(p => {
      if (p.isLocked) return p;
      
      const loadingPersona: Persona = {
        ...p,
        status: 'loading',
        name: 'Loading...',
        description: 'Fetching new persona...',
        avatar: '/placeholder-avatar.png',
      };
      return loadingPersona;
    }));
    
    try {
      // Fetch new personas from the API
      const newPersonas = await fetchPersonas(unlockedCount);
      let newPersonaIndex = 0;
      
      // Update the personas state with the new personas
      setPersonas(prev => prev.map(p => {
        if (p.isLocked) return p;
        
        const newPersona = newPersonas[newPersonaIndex++];
        const updatedPersona: Persona = {
          ...p,
          name: newPersona.name,
          type: newPersona.type,
          description: newPersona.description,
          avatar: newPersona.avatar,
          status: 'idle',
          messages: [],
          feedback: undefined,
          timeElapsed: undefined
        };
        return updatedPersona;
      }));
    } catch (_err) {
      console.error('Error shuffling personas');
      
      // Fallback to local generation if API fails
      setPersonas(prev => {
        const newPersonas = generatePersonas(unlockedCount);
        let newPersonaIndex = 0;
        
        return prev.map(p => {
          if (p.isLocked) return p;
          
          const newPersona = newPersonas[newPersonaIndex++];
          const updatedPersona: Persona = {
            ...p,
            name: newPersona.name,
            type: newPersona.type,
            description: newPersona.description,
            avatar: newPersona.avatar,
            status: 'idle',
            messages: [],
            feedback: undefined,
            timeElapsed: undefined
          };
          return updatedPersona;
        });
      });
    }
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

  const isPersona = (obj: any): obj is Persona => {
    return obj && typeof obj === 'object' && 'id' in obj && 'status' in obj;
  };

  const handleStartTesting = async () => {
    if (!url) return;
    
    setIsLoading(true);
    
    try {
      const isAvailable = await checkWebsiteAvailability(url);
      
      if (!isAvailable) {
        setError('Website is not available. Please check the URL and try again.');
        setIsLoading(false);
        return;
      }
      
      // Trigger persona generation via the useEffect
      setShouldGeneratePersonas(true);
      
      // Rest of the function...
    } catch (error) {
      console.error('Error during testing:', error);
      setError('Sorry, there was an error testing the website. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTest = () => {
    setUrl('');
    setUrlInput('');
    setReport(null);
    setShowReport(false);
    setTestStarted(false);
    setTestCompleted(false);
    setIsLoading(false);
    setError(null);
    setChatMessages([{
      id: 'initial',
      content: 'Enter a website URL above and I\'ll help test it with our personas.',
      sender: 'system',
      timestamp: Date.now(),
    }]);
    
    // Trigger persona generation via the useEffect
    setShouldGeneratePersonas(true);
  };

  const addRandomPersona = () => {
    // Trigger persona generation via the useEffect
    setShouldGeneratePersonas(true);
  };

  const removePersona = (id: string) => {
    setPersonas(current => current.filter(p => p.id !== id));
  };

  const handleGeneratePersonas = undefined;
  const handleMessage = undefined;

  // Initialize personas
  useEffect(() => {
    if (shouldGeneratePersonas) {
      setShouldGeneratePersonas(false);
      setIsLoading(true);
      
      // Use the new async function to fetch personas from the API
      fetchPersonas(5)
        .then(fetchedPersonas => {
          setPersonas(fetchedPersonas);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching personas:', error);
          // Fallback to local generation if API fails
          setPersonas(generatePersonas(5));
          setIsLoading(false);
        });
    }
  }, [shouldGeneratePersonas]);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-dark-blue transition-colors overflow-x-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe')] opacity-10 mix-blend-overlay pointer-events-none" />
      <div className="container mx-auto px-4 py-6 min-h-screen flex flex-col">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div 
              ref={logoRef} 
              onClick={() => {
                setUrlInput('');
                setPersonas([]);
                setReport(null);
                setShowReport(false);
                setChatMessages([{
                  id: 'initial',
                  content: 'Enter a website URL above and I\'ll help test it with our personas.',
                  sender: 'system',
                  timestamp: Date.now(),
                }]);
              }}
              className={`flex items-center gap-3 transition-all duration-700 cursor-pointer ${
                isLogoInView && shouldAnimateLogo ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
              }`}
            >
              <div className="p-2 rounded-xl bg-gradient-custom shadow-glow bounce-hover">
                <Bot className="w-10 h-10 text-white bot-icon" />
              </div>
              <h1 className={`text-5xl text-gradient font-display tracking-wide font-[400] transition-all duration-1000 delay-300 ${
                isLogoInView && shouldAnimateLogo ? 'opacity-100 translate-x-0 blur-0' : 'opacity-0 -translate-x-8 blur-sm'
              }`}>
                kolidos
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
                      href="https://github.com/dylantarre/kolidos"
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
                        ) : urlInput.trim() !== '' && (
                          <CheckCircle2 
                            className={`w-5 h-5 ${isUrlValid ? 'text-green-500 checkmark-glow' : 'text-red-500 error-glow'}`} 
                            fill="currentColor" 
                          />
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
                      onClick={handleStartTesting}
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
              <div className="flex justify-between items-center mb-4">
                {personas.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-custom text-white' 
                          : 'bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-gradient-custom text-white' 
                          : 'bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/10'
                      }`}
                      title="List View"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
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
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr' 
                      : 'flex flex-col gap-2'
                  } pb-6`}>
                    {personas.map((persona, index) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        onRefresh={refreshPersona}
                        onToggleLock={toggleLock}
                        index={index}
                        viewMode={viewMode}
                      />
                    ))}
                    <PersonaCard
                      isControlCard
                      onAdd={addRandomPersona}
                      onShuffle={shufflePersonas}
                      viewMode={viewMode}
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