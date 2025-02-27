import type { Persona } from '../types';

const PLACEHOLDER_NAMES = [
  'Analytical Anna',
  'Digital David',
  'Mobile Maria',
  'Social Sophie',
  'Gaming Gary',
  'Remote Rachel',
  'Trendy Tyler',
  'Eco-conscious Emma'
];

const PLACEHOLDER_TYPES = [
  'Digital Native',
  'Remote Worker',
  'Social Media Expert',
  'Mobile-First User',
  'Tech Enthusiast',
  'Casual Browser',
  'Power User'
];

const PLACEHOLDER_DESCRIPTIONS = [
  'Expects seamless digital experiences across all devices',
  'Values efficiency and clear navigation in applications',
  'Highly engaged with social features and sharing capabilities',
  'Primarily accesses content through mobile devices',
  'Early adopter of new technologies and features',
  'Prefers simple and straightforward interfaces',
  'Looks for advanced features and customization options'
];

const PLACEHOLDER_AVATARS = [
  'https://api.dicebear.com/7.x/personas/svg?seed=1',
  'https://api.dicebear.com/7.x/personas/svg?seed=2',
  'https://api.dicebear.com/7.x/personas/svg?seed=3',
  'https://api.dicebear.com/7.x/personas/svg?seed=4',
  'https://api.dicebear.com/7.x/personas/svg?seed=5'
];

export function generatePlaceholderPersona(index: number): Persona {
  return {
    id: `persona-${index + 1}`,
    name: PLACEHOLDER_NAMES[index % PLACEHOLDER_NAMES.length],
    type: PLACEHOLDER_TYPES[index % PLACEHOLDER_TYPES.length],
    description: PLACEHOLDER_DESCRIPTIONS[index % PLACEHOLDER_DESCRIPTIONS.length],
    avatar: PLACEHOLDER_AVATARS[index % PLACEHOLDER_AVATARS.length],
    status: 'idle',
    isLocked: false,
    messages: []
  };
}

export function generatePersonas(count: number): Persona[] {
  return Array(count).fill(null).map((_, index) => generatePlaceholderPersona(index));
}

// API key for Kolidos API
const API_KEY = 'd7342c173c86ec331b94e5f28b600412a992a9addd3a2a0fc3efcc87450871a1';

/**
 * Fetches a random persona from the Kolidos API
 * @returns Promise<Persona>
 */
export async function fetchRandomPersona(): Promise<Persona> {
  try {
    const response = await fetch('https://gen.kolidos.com/random-name', {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Create a persona from the API response
    return {
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      type: getRandomItem(PLACEHOLDER_TYPES),
      description: data.base_persona,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${data.name.replace(/\s+/g, '')}`,
      status: 'idle',
      isLocked: false,
      messages: []
    };
  } catch (error) {
    console.error('Error fetching persona from API:', error);
    // Fallback to a placeholder persona if the API call fails
    return generatePlaceholderPersona(Math.floor(Math.random() * PLACEHOLDER_NAMES.length));
  }
}

/**
 * Fetches multiple personas from the Kolidos API
 * @param count Number of personas to fetch
 * @returns Promise<Persona[]>
 */
export async function fetchPersonas(count: number): Promise<Persona[]> {
  try {
    const personaPromises = Array(count)
      .fill(null)
      .map(() => fetchRandomPersona());
    
    return await Promise.all(personaPromises);
  } catch (error) {
    console.error('Error fetching personas:', error);
    // Fallback to placeholder personas if the API calls fail
    return generatePersonas(count);
  }
}

// Helper function to get a random item from an array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
} 