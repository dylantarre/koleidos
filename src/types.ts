// Represents a user persona with their characteristics and testing status
export interface Persona {
  id: string;
  name: string;
  avatar: string;
  type: string;
  description: string;
  status: 'idle' | 'loading' | 'testing' | 'completed';
  isLocked: boolean;
  feedback?: string;
  timeElapsed?: number;
  demographics?: {
    age: number;
    gender: string;
    occupation: string;
    education: string;
    location: string;
  };
  goals?: string[];
  frustrations?: string[];
  behaviors?: string[];
  motivations?: string[];
  techProficiency?: string;
  preferredChannels?: string[];
  messages?: Array<{
    id: string;
    content: string;
    messageType: 'user' | 'persona';
    timestamp: number;
  }>;
}

// Represents the results of website testing
export interface TestReport {
  url: string;
  summary: string;
  successes: string[];
  recommendations: string[];
  commonIssues: string[];
  overallScore: number;
  completedTests: number;
  totalTests: number;
}

interface DemographicItem {
  label: string;
  value: string;
}

export interface DetailedPersona extends Persona {
  demographics: DemographicItem[];
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  motivations: string[];
  techProficiency: {
    high?: string;
    moderate?: string;
    low?: string;
  };
  preferredChannels: string[];
}