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