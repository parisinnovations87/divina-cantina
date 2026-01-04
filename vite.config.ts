import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Usa la variabile di sistema (se disponibile nell'ambiente AI/Container) 
      // oppure quella definita nel file .env locale
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.VITE_GEMINI_API_KEY || env.API_KEY),
    }
  }
})