import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json'

declare const process: {
  env: Record<string, string | undefined>
}

const appVersion = packageJson.version
const builtAt = new Date().toISOString()
const buildId = process.env.GITHUB_SHA?.slice(0, 12) ?? builtAt

export default defineConfig({
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
  },
  plugins: [
    react(),
    {
      name: 'jod-lakhrueng-version-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({
            version: appVersion,
            buildId,
            builtAt,
          }, null, 2),
        })
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'จดละครึ่ง พลัส',
        short_name: 'จดละครึ่ง',
        description: 'ติดตามสิทธิโครงการไทยช่วยไทย พลัส (60/40)',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        lang: 'th',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,avif,webp,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
