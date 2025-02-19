import json
import random
import os
import sys
from typing import Dict, List, Optional
import openai
from datasets import load_dataset

RANDOM_PERSONA_TEMPLATE = """Create a random user persona with diverse interests and backgrounds.
The persona should be realistic but not necessarily interested in this type of website.
You must return a JSON object with EXACTLY this structure (example values shown):
{
  "name": "Sarah Chen",
  "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "type": "Digital Native",
  "description": "Tech-savvy professional who values efficiency and user experience",
  "demographics": {
    "age": 28,
    "gender": "Female",
    "occupation": "Product Manager",
    "education": "Master's in Business Administration",
    "location": "San Francisco, CA"
  },
  "goals": [
    "Streamline daily workflows",
    "Stay updated with industry trends",
    "Build meaningful connections"
  ],
  "frustrations": [
    "Complex navigation systems",
    "Slow loading times",
    "Inconsistent user interfaces"
  ],
  "behaviors": [
    "Frequently uses mobile devices",
    "Researches thoroughly before decisions",
    "Active on professional networks"
  ],
  "motivations": [
    "Career growth",
    "Learning new skills",
    "Solving complex problems"
  ],
  "techProficiency": "High",
  "preferredChannels": [
    "Mobile apps",
    "Web platforms",
    "Professional networks"
  ]
}"""

POTENTIAL_USER_TEMPLATE = """Create a detailed UX persona who would be a potential user of this website: {url}
The persona should be realistic and specific to this type of website.
You must return a JSON object with EXACTLY this structure (example values shown):
{
  "name": "Michael Rodriguez",
  "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "type": "Tech Professional",
  "description": "Software developer seeking efficient development tools and resources",
  "demographics": {
    "age": 32,
    "gender": "Male",
    "occupation": "Senior Software Engineer",
    "education": "Bachelor's in Computer Science",
    "location": "Austin, TX"
  },
  "goals": [
    "Find reliable development resources",
    "Improve coding efficiency",
    "Stay updated with latest technologies"
  ],
  "frustrations": [
    "Outdated documentation",
    "Poor API integration examples",
    "Limited community support"
  ],
  "behaviors": [
    "Regular code contributions",
    "Active in tech communities",
    "Early adopter of new tools"
  ],
  "motivations": [
    "Technical excellence",
    "Professional growth",
    "Community collaboration"
  ],
  "techProficiency": "Expert",
  "preferredChannels": [
    "GitHub",
    "Stack Overflow",
    "Developer forums"
  ]
}"""

def validate_persona(persona: Dict) -> None:
    """Validate persona fields and their types."""
    validations = [
        {'field': 'name', 'type': str},
        {'field': 'avatar', 'type': str},
        {'field': 'type', 'type': str},
        {'field': 'description', 'type': str},
        {'field': 'demographics', 'type': dict},
        {'field': 'goals', 'type': list},
        {'field': 'frustrations', 'type': list},
        {'field': 'behaviors', 'type': list},
        {'field': 'motivations', 'type': list},
        {'field': 'techProficiency', 'type': str},
        {'field': 'preferredChannels', 'type': list}
    ]

    errors = []
    for validation in validations:
        value = persona.get(validation['field'])
        if value is None:
            errors.append(f"Missing field: {validation['field']}")
        elif validation['type'] == list:
            if not isinstance(value, list):
                errors.append(f"Invalid type for {validation['field']}: expected list, got {type(value).__name__}")
        elif not isinstance(value, validation['type']):
            errors.append(f"Invalid type for {validation['field']}: expected {validation['type'].__name__}, got {type(value).__name__}")

    if errors:
        print('Validation errors:', errors)
        print('Persona:', persona)
        raise ValueError(f"Validation errors: {', '.join(errors)}")

    # Validate array contents are strings
    array_fields = ['goals', 'frustrations', 'behaviors', 'motivations', 'preferredChannels']
    for field in array_fields:
        if not all(isinstance(item, str) for item in persona[field]):
            raise ValueError(f"All items in {field} must be strings")

    # Validate demographics fields
    demographic_validations = [
        {'field': 'age', 'type': (int, float)},
        {'field': 'gender', 'type': str},
        {'field': 'occupation', 'type': str},
        {'field': 'education', 'type': str},
        {'field': 'location', 'type': str}
    ]

    demographic_errors = []
    demographics = persona.get('demographics', {})
    for validation in demographic_validations:
        value = demographics.get(validation['field'])
        if value is None:
            demographic_errors.append(f"Missing demographic field: {validation['field']}")
        elif not isinstance(value, validation['type']):
            demographic_errors.append(f"Invalid type for demographic {validation['field']}: expected {validation['type'].__name__}, got {type(value).__name__}")

    if demographic_errors:
        print('Demographics validation errors:', demographic_errors)
        print('Demographics:', demographics)
        raise ValueError(f"Demographics validation errors: {', '.join(demographic_errors)}")

def load_personahub_dataset() -> List[Dict]:
    """Load and cache the PersonaHub dataset."""
    try:
        dataset = load_dataset("json", data_files="persona.jsonl")
        return dataset["train"]
    except Exception as e:
        print(f"Error loading PersonaHub dataset: {e}")
        return []

def filter_personas(personas: List[Dict], url: str, persona_type: str = 'potential') -> List[Dict]:
    """Filter personas based on type and URL relevance."""
    if not personas:
        return []
        
    if persona_type == 'random':
        # For random type, just return a diverse subset
        return random.sample(personas, min(5, len(personas)))
    
    # For potential users, try to find relevant personas
    relevant_personas = []
    url_keywords = url.lower().split('.')
    
    for persona in personas:
        relevance_score = 0
        
        # Check interests against URL
        interests = (
            persona.get('interests', []) + 
            persona.get('hobbies', []) + 
            persona.get('skills', []) +
            persona.get('goals', [])
        )
        
        for interest in interests:
            if any(keyword in interest.lower() for keyword in url_keywords):
                relevance_score += 1
                
        # Check tech proficiency for tech-related sites
        tech_keywords = ['tech', 'software', 'developer', 'programming', 'code']
        if any(keyword in url.lower() for keyword in tech_keywords):
            if persona.get('techProficiency', '').lower() in ['high', 'expert']:
                relevance_score += 2
                
        if relevance_score > 0:
            relevant_personas.append((persona, relevance_score))
    
    # Sort by relevance and take top 5
    relevant_personas.sort(key=lambda x: x[1], reverse=True)
    return [p[0] for p in relevant_personas[:5]] or random.sample(personas, min(5, len(personas)))

def enhance_persona_with_hub(base_persona: Dict, hub_personas: List[Dict]) -> Dict:
    """Enhance a generated persona with PersonaHub context."""
    if not hub_personas:
        return base_persona
        
    # Find most similar hub persona
    similar_persona = random.choice(hub_personas)
    
    # Enhance with additional fields from hub
    enhanced = {
        **base_persona,
        'interests': similar_persona.get('interests', []),
        'skills': similar_persona.get('skills', []),
        'hobbies': similar_persona.get('hobbies', []),
        'personality_traits': similar_persona.get('personality_traits', []),
        'pain_points': similar_persona.get('pain_points', []),
        'goals': list(set(base_persona.get('goals', []) + similar_persona.get('goals', []))),
        'frustrations': list(set(base_persona.get('frustrations', []) + similar_persona.get('frustrations', [])))
    }
    
    # Enhance description with personality traits
    traits = similar_persona.get('personality_traits', [])
    if traits:
        trait_str = f" {traits[0].lower()}"
        if len(traits) > 1:
            trait_str += f" and {traits[1].lower()}"
        enhanced['description'] = enhanced['description'].rstrip('.') + f", who is{trait_str}."
    
    return enhanced

def generate_persona(url: str, persona_type: str = 'potential') -> Dict:
    """Generate a persona using OpenAI and enhance with PersonaHub data."""
    try:
        openai.api_key = os.getenv('OPENAI_API_KEY')
        if not openai.api_key:
            raise ValueError("OpenAI API key is not configured")

        # Load PersonaHub data
        hub_personas = load_personahub_dataset()
        relevant_personas = filter_personas(hub_personas, url, persona_type)
        
        # Create template with PersonaHub influence
        template = RANDOM_PERSONA_TEMPLATE if persona_type == 'random' else POTENTIAL_USER_TEMPLATE.replace("{url}", url)
        if relevant_personas:
            example = random.choice(relevant_personas)
            template += f"\n\nConsider incorporating some of these traits in your response:\nInterests: {example.get('interests', [])}\nSkills: {example.get('skills', [])}\nPersonality: {example.get('personality_traits', [])}"
        
        print(f'Using template: {template}')
        
        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a UX research expert who creates detailed user personas. You must respond with valid JSON that EXACTLY matches the schema provided, including all fields with appropriate types. Do not include any explanation or text outside the JSON object."
                },
                {
                    "role": "user",
                    "content": template
                }
            ],
            temperature=0.7,
            max_tokens=2000,
            response_format={ "type": "json_object" }
        )
        
        print(f'OpenAI response: {completion.choices[0].message}')
        
        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response from OpenAI")
            
        try:
            persona = json.loads(content)
            validate_persona(persona)
            
            # Enhance with PersonaHub data
            if relevant_personas:
                persona = enhance_persona_with_hub(persona, relevant_personas)
            
            return {
                **persona,
                'id': f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                'status': 'idle',
                'isLocked': False,
                'messages': []
            }
        except json.JSONDecodeError as e:
            print(f"Raw OpenAI response: {content}")
            print(f"Parse error: {str(e)}")
            raise ValueError(f"Invalid JSON response: {str(e)}")
    except Exception as e:
        print(f"Error in generate_persona: {str(e)}")
        raise

def generate_personas(url: str, count: int = 5, persona_type: str = 'potential') -> List[Dict]:
    """Generate multiple personas."""
    try:
        personas = []
        for _ in range(count):
            persona = generate_persona(url, persona_type)
            personas.append(persona)
        return personas
    except Exception as e:
        raise Exception(f"Error generating personas: {str(e)}")

if __name__ == "__main__":
    try:
        # Get arguments from command line
        if len(sys.argv) < 4:
            print(json.dumps({
                'error': 'Missing arguments. Required: url count persona_type'
            }))
            sys.exit(1)
            
        test_url = sys.argv[1]
        count = int(sys.argv[2])
        persona_type = sys.argv[3]
        
        try:
            personas = generate_personas(test_url, count, persona_type)
            print(json.dumps(personas))
        except Exception as e:
            print(json.dumps({
                'error': str(e)
            }))
            sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'error': str(e)
        }))
        sys.exit(1) 