import type { Persona, ExpandedPersonaDetails } from '../types';

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
    id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

/**
 * Fetches a random persona name from the Kolidos API
 * @returns Promise with name and base_persona
 */
export async function fetchRandomName(): Promise<{ name: string; base_persona: string }> {
  try {
    // Use the proxy URL instead of direct API call
    console.log('Fetching random name from API...');
    const response = await fetch('/api/kolidos/random-name', {
      method: 'GET',
      // No need to include the API key here as it's handled by the proxy
    });
    
    console.log('Random name API response status:', response.status);
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received random name data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching random name from API:', error);
    throw error;
  }
}

/**
 * Expands a name into a full persona with the Kolidos API
 * @param name The name to expand
 * @param type Optional type/title for the persona
 * @param description Optional description for the persona
 * @returns Promise with the expanded persona details
 */
export async function expandPersona(
  name: string, 
  type?: string, 
  description?: string
): Promise<ExpandedPersonaDetails> {
  try {
    console.log(`Expanding persona: ${name} (${type})`);
    const response = await fetch('/api/kolidos/expand-persona', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // API key is handled by the proxy
      },
      body: JSON.stringify({
        name,
        title: type,
        description
      })
    });
    
    console.log('Expand persona API response status:', response.status);
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received expanded persona data:', data);
    return data;
  } catch (error) {
    console.error('Error expanding persona from API:', error);
    throw error;
  }
}

/**
 * Fetches a random persona from the Kolidos API
 * First gets a random name, then expands it into a full persona
 * @returns Promise<Persona>
 */
export async function fetchRandomPersona(): Promise<Persona> {
  try {
    // Step 1: Get a random name
    const nameData = await fetchRandomName();
    
    // Create a basic persona with just the name and base description
    const basicPersona: Persona = {
      id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameData.name,
      type: getRandomItem(PLACEHOLDER_TYPES),
      description: nameData.base_persona,
      avatar: `https://api.dicebear.com/7.x/personas/svg?seed=${nameData.name.replace(/\s+/g, '')}`,
      status: 'loading',
      isLocked: false,
      messages: [],
      expanded: false
    };
    
    return basicPersona;
  } catch (error) {
    console.error('Error fetching persona from API:', error);
    // Fallback to a placeholder persona if the API call fails
    return generatePlaceholderPersona(Math.floor(Math.random() * PLACEHOLDER_NAMES.length));
  }
}

/**
 * Expands a basic persona with additional details from the API
 * @param persona The basic persona to expand
 * @returns Promise<Persona> with expanded details
 */
export async function expandPersonaDetails(persona: Persona): Promise<Persona> {
  if (persona.expanded) {
    return persona; // Already expanded
  }
  
  try {
    const expandedData = await expandPersona(
      persona.name,
      persona.type,
      persona.description
    );
    
    // Merge the expanded data with the existing persona
    return {
      ...persona,
      expanded: true,
      status: 'idle',
      // Add any additional fields from the expanded data
      // This will depend on what the API returns
      expandedDetails: expandedData,
      // You might want to update some fields based on the expanded data
      description: expandedData.description || persona.description
    };
  } catch (error) {
    console.error('Error expanding persona details:', error);
    // Return the original persona but mark it as no longer loading
    return {
      ...persona,
      status: 'idle'
    };
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