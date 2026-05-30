import { startVersionUpdateChecks } from './versionUpdate'

const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      void registration.update()
      startVersionUpdateChecks(registration)

      window.setInterval(() => {
        if (registration.installing) return
        void registration.update()
      }, UPDATE_CHECK_INTERVAL_MS)
    })
  })
}
