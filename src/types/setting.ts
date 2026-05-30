export type SchemeSetting = {
  subsidyRate: number    // default 0.6
  dailyCap: number       // default 200
  monthlyCap: number     // default 1000 (resets monthly, does not carry over)
  totalCap: number       // default 4000 (max over entire campaign lifetime)
  startDate?: string     // default '2026-06-01'
  endDate?: string       // default '2026-09-30'
  currency: 'THB'
  updatedAt: string
}

export const DEFAULT_SCHEME: SchemeSetting = {
  subsidyRate: 0.6,
  dailyCap: 200,
  monthlyCap: 1000,
  totalCap: 4000,
  startDate: '2026-06-01',
  endDate: '2026-09-30',
  currency: 'THB',
  updatedAt: new Date().toISOString(),
}

export type AppSetting = {
  fontSizeMode: 'normal' | 'large' | 'extra-large'
  reduceMotion: boolean
  showInstallHint: boolean
  updatedAt: string
}

export const DEFAULT_APP: AppSetting = {
  fontSizeMode: 'normal',
  reduceMotion: false,
  showInstallHint: true,
  updatedAt: new Date().toISOString(),
}
