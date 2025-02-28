// Represents a user persona with their characteristics and testing status
export interface Persona {
  id: string;
  name: string;
  avatar: string;
  type: string;
  description: string;
  status: 'idle' | 'loading' | 'testing' | 'completed';
  isLocked: boolean;
  position?: number;
  feedback?: string;
  timeElapsed?: number;
  expanded?: boolean;
  expandedDetails?: ExpandedPersonaDetails; // Will hold the full expanded persona data from the API
  demographics?: {
    age: number;
    gender: string;
    occupation: string;
    education: string;
    location: string;
  } | DemographicItem[]; // Allow both formats for demographics
  goals?: string[];
  frustrations?: string[];
  behaviors?: string[];
  motivations?: string[];
  techProficiency?: string | {
    high?: string;
    moderate?: string;
    low?: string;
  };
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

// Interface for expanded persona details from the API
export interface ExpandedPersonaDetails {
  // Add fields based on what the API returns
  description?: string;
  background?: string;
  personality?: string;
  interests?: string[];
  challenges?: string[];
  goals?: string[];
  frustrations?: string[];
  behaviors?: string[];
  motivations?: string[];
  techProficiency?: string | {
    high?: string;
    moderate?: string;
    low?: string;
  };
  preferredChannels?: string[];
  demographics?: {
    age?: number;
    gender?: string;
    occupation?: string;
    education?: string;
    location?: string;
  } | DemographicItem[];
  // Additional fields that might be returned
  additionalInfo?: Record<string, string | number | boolean | string[]>;
}