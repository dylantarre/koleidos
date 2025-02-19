const OpenAI = require('openai');
const { spawn } = require('child_process');
const path = require('path');

const RANDOM_PERSONA_TEMPLATE = `Create a random user persona with diverse interests and backgrounds.
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
}`;

const POTENTIAL_USER_TEMPLATE = `Create a detailed UX persona who would be a potential user of this website: {url}
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
}`;

async function generatePersona(url, openai, type = 'potential') {
  try {
    // Generate persona directly with OpenAI instead of using dataset
    const template = type === 'random' ? RANDOM_PERSONA_TEMPLATE : POTENTIAL_USER_TEMPLATE.replace("{url}", url);
    
    console.log('Using template:', template);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a UX research expert who creates detailed user personas. You must respond with valid JSON that EXACTLY matches the schema provided, including all fields with appropriate types. Do not include any explanation or text outside the JSON object."
        },
        {
          role: "user",
          content: template
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    console.log('OpenAI response:', completion.choices[0].message);
    
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      const persona = JSON.parse(content);
      
      // Validate required fields and their types
      const validations = [
        { field: 'name', type: 'string' },
        { field: 'avatar', type: 'string' },
        { field: 'type', type: 'string' },
        { field: 'description', type: 'string' },
        { field: 'demographics', type: 'object' },
        { field: 'goals', type: 'array' },
        { field: 'frustrations', type: 'array' },
        { field: 'behaviors', type: 'array' },
        { field: 'motivations', type: 'array' },
        { field: 'techProficiency', type: 'string' },
        { field: 'preferredChannels', type: 'array' }
      ];

      const errors = validations.reduce((acc, validation) => {
        const value = persona[validation.field];
        if (value === undefined || value === null) {
          acc.push(`Missing field: ${validation.field}`);
        } else if (validation.type === 'array' && !Array.isArray(value)) {
          acc.push(`Invalid type for ${validation.field}: expected array, got ${typeof value}`);
        } else if (validation.type !== 'array' && typeof value !== validation.type) {
          acc.push(`Invalid type for ${validation.field}: expected ${validation.type}, got ${typeof value}`);
        }
        return acc;
      }, []);

      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        console.error('Persona:', persona);
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }

      // Validate demographics fields
      const requiredDemographics = [
        { field: 'age', type: 'number' },
        { field: 'gender', type: 'string' },
        { field: 'occupation', type: 'string' },
        { field: 'education', type: 'string' },
        { field: 'location', type: 'string' }
      ];

      const demographicErrors = requiredDemographics.reduce((acc, validation) => {
        const value = persona.demographics[validation.field];
        if (value === undefined || value === null) {
          acc.push(`Missing demographic field: ${validation.field}`);
        } else if (typeof value !== validation.type) {
          acc.push(`Invalid type for demographic ${validation.field}: expected ${validation.type}, got ${typeof value}`);
        }
        return acc;
      }, []);

      if (demographicErrors.length > 0) {
        console.error('Demographics validation errors:', demographicErrors);
        console.error('Demographics:', persona.demographics);
        throw new Error(`Demographics validation errors: ${demographicErrors.join(', ')}`);
      }

      // Validate array contents are strings
      ['goals', 'frustrations', 'behaviors', 'motivations', 'preferredChannels'].forEach(field => {
        if (!persona[field].every(item => typeof item === 'string')) {
          throw new Error(`All items in ${field} must be strings`);
        }
      });

      return {
        ...persona,
        id: Date.now().toString() + Math.random(),
        status: 'idle',
        isLocked: false,
        messages: []
      };
    } catch (parseError) {
      console.error('Raw OpenAI response:', content);
      console.error('Parse error:', parseError);
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generatePersona:', error);
    throw error;
  }
}

async function generatePersonasFromHub(url, count, personaType) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'persona_hub.py');
    const python = spawn('python3', [pythonScript, url, count.toString(), personaType]);
    
    let dataString = '';
    
    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }
      
      try {
        const personas = JSON.parse(dataString);
        if (personas.error) {
          reject(new Error(personas.error));
          return;
        }
        resolve(personas);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports.main = async (args) => {
  try {
    console.log('Received args:', args);

    // Handle both direct invocation and HTTP request
    const params = args.__ow_body ? JSON.parse(args.__ow_body) : args;
    console.log('Parsed params:', params);

    if (!params || !params.url) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'URL is required' }
      };
    }

    const { url, count = 5, personaType = 'potential' } = params;

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'OpenAI API key is not configured' }
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    try {
      // Generate personas directly with OpenAI
      const personas = await Promise.all(
        Array(count).fill(null).map(() => generatePersona(url, openai, personaType))
      );

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: personas
      };
    } catch (error) {
      console.error('Error generating personas:', error);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { 
          error: 'Failed to generate personas', 
          details: error.message,
          stack: error.stack
        }
      };
    }
  } catch (error) {
    console.error('Error in main function:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { 
        error: 'Failed to process request', 
        details: error.message,
        stack: error.stack
      }
    };
  }
}; 