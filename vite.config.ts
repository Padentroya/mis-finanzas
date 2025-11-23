import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // Safely expose the API_KEY. If not set during build, defaults to empty string to prevent build crash.
    // The user must set this in Vercel Environment Variables.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist'
  }
});