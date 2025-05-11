import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the backend server
      // Example: /api/topics -> http://localhost:3050/api/topics
      '/api': {
        target: 'http://localhost:3050',
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // If you're proxying to an HTTPS server with self-signed cert
      },
      // Proxy admin API requests (if they have a different base path structure)
      // Example: /admin/questions/pending -> http://localhost:3050/admin/questions/pending
      '/admin': { // This will catch /admin/questions/* etc.
        target: 'http://localhost:3050',
        changeOrigin: true,
        secure: false,
      },
      // Add other specific paths if necessary
    },
  },
})
