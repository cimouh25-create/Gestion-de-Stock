import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Allows accessing the dev server from other devices on the same network.
    // Use your machine's local IP (e.g. 192.168.x.x) in a browser to connect.
    host: '0.0.0.0',
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
