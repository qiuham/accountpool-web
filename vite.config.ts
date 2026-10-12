import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {proxy: {'/console': {target:'http://127.0.0.1:8787',changeOrigin:false}}}, 
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
})
