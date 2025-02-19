const OpenAI = require('openai');

const UX_PERSONA_TEMPLATE = `Create a detailed UX persona who would be a potential user of this website: {url}

Note:
1. The persona should include the following sections:
   - Name: The persona's name
   - Demographics: Age, gender, occupation, education, and location
   - Goals: What the persona aims to achieve with this website
   - Frustrations: Pain points and challenges they might face with this website
   - Behaviors: Typical actions and habits when using websites like this
   - Motivations: What drives them to use this website
   - Technological Proficiency: Their comfort level with technology
   - Preferred Channels: How they prefer to interact with websites
2. Make the persona realistic and specific to this type of website
3. Return the response in JSON format with the following structure:
{
  "name": string,
  "avatar": string (use an Unsplash URL),
  "type": string (their primary user type),
  "description": string (a one-line summary),
  "demographics": {
    "age": number,
    "gender": string,
    "occupation": string,
    "education": string,
    "location": string
  },
  "goals": string[],
  "frustrations": string[],
  "behaviors": string[],
  "motivations": string[],
  "techProficiency": string,
  "preferredChannels": string[]
}`;

async function generatePersona(url, openai) {
  try {
    const completion = await openai.chat.completions.create({
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: "You are a UX research expert who creates detailed user personas."
        },
        {
          role: "user",
          content: UX_PERSONA_TEMPLATE.replace("{url}", url)
        }
      ]
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating persona:', error);
    throw error;
  }
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
        body: { error: 'URL is required' }
      };
    }

    const { url, count } = params;

    console.log('Using OpenAI API key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    if (count) {
      console.log('Generating multiple personas...');
      const personas = await Promise.all(
        Array(count).fill(null).map(() => generatePersona(url, openai))
      );
      console.log('Generated personas:', personas.length);

      return {
        statusCode: 200,
        body: personas
      };
    } else {
      console.log('Generating single persona...');
      const persona = await generatePersona(url, openai);
      console.log('Generated persona:', persona.name);

      return {
        statusCode: 200,
        body: persona
      };
    }
  } catch (error) {
    console.error('Error in main function:', error);
    return {
      statusCode: 500,
      body: { error: 'Failed to generate personas', details: error.message }
    };
  }
}; 