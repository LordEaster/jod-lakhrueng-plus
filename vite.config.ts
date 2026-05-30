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
const assetVersion = encodeURIComponent(buildId)

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
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectRegister: false,
      includeManifestIcons: false,
      manifest: {
        name: 'จดละครึ่ง พลัส',
        short_name: 'จดละครึ่ง',
        description: 'ติดตามสิทธิโครงการไทยช่วยไทย พลัส (60/40)',
        theme_color: '#2563EB',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        id: '/',
        lang: 'th',
        icons: [
          { src: `pwa-192x192.png?v=${assetVersion}`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `pwa-512x512.png?v=${assetVersion}`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `maskable-icon-512x512.png?v=${assetVersion}`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        injectionPoint: undefined,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/read-excel-file')) return 'xlsx-read'
          if (id.includes('node_modules/write-excel-file')) return 'xlsx-write'
          if (id.includes('node_modules/fflate')) return 'xlsx-zip'
        },
      },
    },
  },
})
