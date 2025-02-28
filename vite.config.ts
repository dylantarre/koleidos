import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/kolidos': {
        target: 'https://gen.kolidos.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kolidos/, ''),
        headers: {
          'X-API-Key': 'd7342c173c86ec331b94e5f28b600412a992a9addd3a2a0fc3efcc87450871a1'
        }
      }
    }
  },
  define: {
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  }
});
