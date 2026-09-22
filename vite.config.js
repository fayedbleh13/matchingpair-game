import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/**/*'],
      manifest: {
        name: 'Event Matching Pair Game',
        short_name: 'Pair Game',
        description: 'Interactive fast-paced event matching pair game',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'fullscreen',
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp3,wav,ogg}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024 // 10 MiB to cache high quality audio
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) {
            return 'phaser-engine';
          }
          if (id.includes('node_modules/@vercel/analytics')) {
            return 'vercel-analytics';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1600
  },
  server: {
    port: 3000,
    open: true
  }
});
