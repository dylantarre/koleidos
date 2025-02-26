# Koleidos - AI User Testing Platform

Koleidos is a web application that leverages AI personas to simulate diverse user testing for websites. It generates a variety of virtual user personas who "test" your website and provide detailed feedback, helping you identify usability issues and improvement opportunities.

## Key Features

- **AI-powered User Testing**: Generate diverse user personas with different characteristics and technical backgrounds
- **Website Testing Simulation**: Simulate how different user types interact with and experience your website
- **Detailed Reports**: Get comprehensive feedback and actionable recommendations
- **Interactive Chat**: Ask questions to the personas to get specific insights
- **Persona Management**: Lock and customize personas that you find valuable
- **Dark/Light Mode**: Toggle between visual preferences
- **Authentication**: User accounts with secure login

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **APIs**: 
  - OpenAI for AI-powered persona generation
  - Supabase for authentication and database
- **Containerization**: Docker and Docker Compose for easy deployment

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose (for local deployment)
- Supabase account for authentication
- OpenAI API key

### Environment Variables

Create a `.env` file with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/koleidos.git
cd koleidos
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Or use Docker Compose:
```bash
docker-compose up
```

## Usage

1. Navigate to the application in your browser
2. Enter a website URL to test
3. Select whether you want random users or targeted users
4. Click "Start Testing" to begin the analysis
5. View the test report with insights and recommendations
6. Ask follow-up questions to the personas via the chat interface

## Advanced Features

### Persona Types

Koleidos generates various persona types including:
- Digital Natives
- Remote Workers
- Mobile-First Users
- Social Media Experts
- Accessibility-Focused Users
- Senior Citizens
- Power Users

### Persona Synthesis

The codebase includes Python scripts for generating personas using different LLM providers:
- OpenAI models (`openai_synthesize.py`)
- Ollama (`ollama_synthesize.py`)
- VLLM (`vllm_synthesize.py`)

Run these scripts to generate custom personas:
```bash
cd src/demos
./demo_openai_synthesize.sh
```

## Project Structure

```
koleidos/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   └── personaSynth/    # Persona generation utilities
│   ├── hooks/               # React hooks
│   ├── lib/                 # Library functions
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions
│   └── App.tsx              # Main application component
├── docker-compose.yml       # Docker compose configuration
├── Dockerfile               # Docker build instructions
├── nginx.conf               # Nginx configuration for production
└── package.json             # Project dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the production build

### Docker Setup

The application is containerized with three services:
- `frontend`: The React application
- `personas`: A service for persona generation
- `redis`: Optional caching layer

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgements

- [OpenAI](https://openai.com/) for AI capabilities
- [Supabase](https://supabase.io/) for authentication and database
- [Lucide Icons](https://lucide.dev/) for beautiful UI icons
- [Tailwind CSS](https://tailwindcss.com/) for styling 