/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Use existing public/manifest.json instead of generating one
      manifest: false,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Exclude index.html and dynamic audio from precache so HTML is never frozen stale
        globIgnores: ['**/audio/index.json', '**/index.html'],
        navigateFallback: null,
        runtimeCaching: [
          {
            // NetworkFirst for HTML / navigation requests: always check network first, only fallback to cache if offline
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 24 * 60 * 60, // 1 Day
              },
            },
          },
          {
            urlPattern: /\.(?:mp3|wav|mp4)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'english-media',
              expiration: {
                maxEntries: 350,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
  },
});
