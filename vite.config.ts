import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import seoPlugin from './scripts/seo-plugin.ts'

// Axihex is hosted at the root of https://axihex.com/
export default defineConfig({
  // seoPlugin: a page title, description and link preview for every page, plus the sitemap.
  plugins: [react(), seoPlugin()],
  base: '/',
})
