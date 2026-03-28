import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    https: true,           // ✅ Re-enable HTTPS for mobile camera access
    allowedHosts: 'all'    // 🔥 autorise tous les tunnels
  },
  plugins: [
    basicSsl(),            // ✅ Generates a temporary certificate
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
