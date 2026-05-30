import { useEffect } from 'react'
import { useAppSetting } from '../hooks/useSettings'
import type { AppSetting } from '../types/setting'

type AppliedAppPreference = Pick<AppSetting, 'fontSizeMode' | 'reduceMotion'>

export function applyAppPreferences(setting: AppliedAppPreference) {
  document.documentElement.dataset.fontSize = setting.fontSizeMode
  document.documentElement.dataset.reduceMotion = String(setting.reduceMotion)
}

export default function AppPreferences() {
  const appSetting = useAppSetting()

  useEffect(() => {
    applyAppPreferences(appSetting)
  }, [appSetting.fontSizeMode, appSetting.reduceMotion])

  return null
}
