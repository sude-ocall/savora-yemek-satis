import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ağdaki diğer cihazlardan erişim için
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      }
    }
  }
})