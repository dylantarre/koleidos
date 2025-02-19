import type { Persona } from '../types';

const API_ENDPOINT = 'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-4e471e25-87cf-4454-973a-278972bb9aa4/personas/generate';

export async function generatePersona(url: string, personaType: 'random' | 'potential' = 'potential'): Promise<Persona> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      url, 
      personaType,
      template: personaType === 'random' ? 'RANDOM_PERSONA_TEMPLATE' : 'POTENTIAL_USER_TEMPLATE'
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Server error:', data);
    throw new Error(data.error || data.details || 'Failed to generate persona');
  }

  return {
    ...data,
    id: Date.now().toString() + Math.random(),
    status: 'idle',
    isLocked: false,
    messages: []
  };
}

export async function generatePersonas(
  url: string,
  count: number,
  onProgress: (persona: Persona, index: number) => void,
  personaType: 'random' | 'potential' = 'potential'
): Promise<Persona[]> {
  const personas: Persona[] = [];

  for (let i = 0; i < count; i++) {
    // Create placeholder persona
    const placeholderPersona: Persona = {
      id: `persona-${i + 1}`,
      name: `Persona ${i + 1}`,
      avatar: `/placeholder-avatar-${(i % 5) + 1}.png`,
      type: personaType === 'random' ? 'Random User' : 'Potential User',
      description: 'Generating persona...',
      status: 'loading',
      messages: [],
      isLocked: false,
      timeElapsed: 0,
      feedback: ''
    };

    onProgress(placeholderPersona, i);

    try {
      const persona = await generatePersona(url, personaType);
      const finalPersona: Persona = {
        ...persona,
        id: placeholderPersona.id,
        status: 'idle',
        messages: []
      };

      personas.push(finalPersona);
      onProgress(finalPersona, i);
    } catch (error) {
      console.error('Error generating persona:', error);
      const errorPersona: Persona = {
        ...placeholderPersona,
        description: 'Error generating persona',
        status: 'completed',
        feedback: 'Failed to generate persona. Please try again.',
      };
      personas.push(errorPersona);
      onProgress(errorPersona, i);
    }
  }

  return personas;
} 