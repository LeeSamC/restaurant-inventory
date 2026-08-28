import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Restaurant Inventory',
        short_name: 'Inventory',
        description: 'Restaurant inventory management system',
        theme_color: '#111827',
        background_color: 'f3f4f6',
        display: 'standalone',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg}'
        ]
      }
    })
  ]
})