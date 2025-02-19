import type { Persona } from '../types';

const API_ENDPOINT = 'https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-4e471e25-87cf-4454-973a-278972bb9aa4/personas/generate';

export async function generatePersona(url: string): Promise<Persona> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate persona' }));
    throw new Error(error.error || 'Failed to generate persona');
  }

  const persona = await response.json();
  return {
    ...persona,
    id: Date.now().toString() + Math.random(),
    status: 'idle',
    isLocked: false
  };
}

export async function generatePersonas(url: string, count: number = 5): Promise<Persona[]> {
  const personas: Persona[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const persona = await generatePersona(url);
      personas.push(persona);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to generate persona ${i + 1}:`, error);
    }
  }

  if (personas.length === 0) {
    throw new Error('Failed to generate any personas');
  }

  return personas;
} 