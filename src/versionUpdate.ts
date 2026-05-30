const VERSION_CHECK_INTERVAL_MS = 15 * 60 * 1000

type VersionManifest = {
  version: string
  buildId: string
  builtAt: string
}

async function fetchVersionManifest(): Promise<VersionManifest | null> {
  try {
    const response = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })

    if (!response.ok) return null
    return (await response.json()) as VersionManifest
  } catch {
    return null
  }
}

async function checkForUpdatedVersion(registration?: ServiceWorkerRegistration) {
  const remoteVersion = await fetchVersionManifest()
  if (!remoteVersion?.buildId || remoteVersion.buildId === __APP_BUILD_ID__) return

  const activeRegistration = registration ?? await navigator.serviceWorker?.getRegistration()
  await activeRegistration?.update()
}

export function startVersionUpdateChecks(registration?: ServiceWorkerRegistration) {
  void checkForUpdatedVersion(registration)

  window.setInterval(() => {
    void checkForUpdatedVersion(registration)
  }, VERSION_CHECK_INTERVAL_MS)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      void checkForUpdatedVersion(registration)
    }
  })
}
