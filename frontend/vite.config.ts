import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'multifaced-fawn-plushily.ngrok-free.dev', // ✅ allow your ngrok domain
    ],
    host: true, // ✅ important for external access
  },
})
