import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The site is served from chahine00.github.io/my-portfolio/, so every URL starts with this.
  base: '/my-portfolio/',
})
