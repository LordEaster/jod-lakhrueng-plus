import { registerSW } from 'virtual:pwa-register'
import { startVersionUpdateChecks } from './versionUpdate'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    void registration.update()
    startVersionUpdateChecks(registration)

    window.setInterval(() => {
      if (registration.installing) return
      void registration.update()
    }, UPDATE_CHECK_INTERVAL_MS)
  },
})
