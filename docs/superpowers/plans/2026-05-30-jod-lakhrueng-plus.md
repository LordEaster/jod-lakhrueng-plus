# จดละครึ่ง พลัส Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build จดละครึ่ง พลัส — a Thai-language local-first PWA for tracking 60/40 government subsidy (โครงการคนละครึ่ง พลัส) daily and monthly spending caps.

**Architecture:** Walking skeleton — pure logic with tests first, Dexie.js DB layer second, then React pages. Subsidy amounts computed on-the-fly from raw `amount` values; never stored. All data stays on-device; no backend.

**Tech Stack:** React 18 + TypeScript 5 + Vite 5 + Tailwind CSS 3 + React Router v6 + Dexie.js 4 + dexie-react-hooks + vite-plugin-pwa + nanoid + Vitest

---

## File Map

```
src/
  types/
    purchase.ts          — PurchaseEntry, EnrichedEntry, DailySummary, MonthlySummary
    setting.ts           — SchemeSetting, AppSetting, defaults, CATEGORY_LABELS
  logic/
    calculateSubsidy.ts  — calculateDailySubsidy, getDailySummary, getMonthlySummary
    formatThai.ts        — formatThaiDate, formatThaiMonth, formatAmount, todayKey, thisMonthKey
  db/
    db.ts                — Dexie AppDatabase class + singleton
    purchaseRepository.ts
    settingRepository.ts
  hooks/
    useSettings.ts       — useSchemeSetting, useAppSetting
    useCampaignStatus.ts — returns 'before' | 'active' | 'after' | 'unrestricted'
    useDailySummary.ts   — useLiveQuery-based reactive hook
    useMonthlySummary.ts — useLiveQuery-based reactive hook
  components/
    BottomNav.tsx
    TodaySummaryCard.tsx
    MonthSummaryCard.tsx
    AmountShortcutGrid.tsx
    QuickRepeatButtons.tsx
    PurchaseListItem.tsx
    ConfirmDialog.tsx
    EmptyState.tsx
    CampaignLockScreen.tsx
    InstallHint.tsx
  pages/
    HomePage.tsx
    AddPurchasePage.tsx
    HistoryPage.tsx      (lazy)
    SettingsPage.tsx     (lazy)
    PrivacyPage.tsx      (lazy)
  styles/
    globals.css
  test/
    setup.ts
  main.tsx
  App.tsx
.github/workflows/deploy.yml
public/
  CNAME
  logo.svg             — source SVG for PWA icon generation
  icons/               — generated PNG icons (192, 512)
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npm create)
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `tsconfig.json`, `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx` (stub)
- Create: `src/App.tsx` (stub)
- Create: `src/styles/globals.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Scaffold Vite project into current directory**

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty", choose **Ignore files and continue**.

Expected: `package.json`, `src/`, `index.html`, `vite.config.ts` created.

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router-dom dexie dexie-react-hooks nanoid
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa vitest @vitest/ui jsdom @testing-library/jest-dom @testing-library/react @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 3: Configure `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: Replace `src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');

:root {
  font-family: 'Sarabun', sans-serif;
}

* {
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 5: Replace `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 6: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Add `types` to `tsconfig.json` compilerOptions**

Open `tsconfig.json`, add `"vitest/globals"` to the `types` array (or add the array if absent):

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

- [ ] **Step 8: Replace `index.html` with Thai-locale version**

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="theme-color" content="#2563EB" />
    <title>จดละครึ่ง พลัส</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Create stub `src/App.tsx`**

```tsx
export default function App() {
  return <div className="p-4 font-sans">จดละครึ่ง พลัส</div>
}
```

- [ ] **Step 10: Replace `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:5173`, shows "จดละครึ่ง พลัส" in Sarabun font.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold React+Vite+Tailwind+Vitest project"
```

---

## Task 2: Types & Constants

**Files:**
- Create: `src/types/purchase.ts`
- Create: `src/types/setting.ts`

- [ ] **Step 1: Create `src/types/purchase.ts`**

```ts
export type PurchaseCategory = 'food' | 'drink' | 'household' | 'medicine' | 'other'

export const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  food: 'อาหาร',
  drink: 'เครื่องดื่ม',
  household: 'ของใช้ในบ้าน',
  medicine: 'ยาและสุขภาพ',
  other: 'อื่นๆ',
}

export type PurchaseEntry = {
  id: string
  date: string        // "2026-05-30" CE — used for daily queries
  month: string       // "2026-05" CE — used for monthly queries
  amount: number      // raw purchase amount; subsidy computed on-the-fly
  title?: string
  category?: PurchaseCategory
  note?: string
  createdAt: string   // ISO timestamp — used to order entries for cap calculation
  updatedAt: string
}

export type EnrichedEntry = PurchaseEntry & {
  subsidyAmount: number
  userPaidAmount: number
}

export type DailySummary = {
  totalAmount: number
  totalSubsidy: number
  totalUserPaid: number
  remainingDaily: number
  remainingMonthly: number
  toFillDaily: number      // amount to buy to max out today's subsidy
  entries: EnrichedEntry[]
}

export type MonthlySummary = {
  totalAmount: number
  totalSubsidy: number
  totalUserPaid: number
  remainingMonthly: number
}
```

- [ ] **Step 2: Create `src/types/setting.ts`**

```ts
export type SchemeSetting = {
  subsidyRate: number    // default 0.6
  dailyCap: number       // default 200
  monthlyCap: number     // default 1000
  startDate?: string     // campaign start YYYY-MM-DD
  endDate?: string       // campaign end YYYY-MM-DD
  currency: 'THB'
  updatedAt: string
}

export type AppSetting = {
  fontSizeMode: 'normal' | 'large' | 'extra-large'
  reduceMotion: boolean
  showInstallHint: boolean
  updatedAt: string
}

export const DEFAULT_SCHEME: SchemeSetting = {
  subsidyRate: 0.6,
  dailyCap: 200,
  monthlyCap: 1000,
  currency: 'THB',
  updatedAt: new Date().toISOString(),
}

export const DEFAULT_APP: AppSetting = {
  fontSizeMode: 'normal',
  reduceMotion: false,
  showInstallHint: true,
  updatedAt: new Date().toISOString(),
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types and constants"
```

---

## Task 3: Core Logic — calculateSubsidy (TDD)

**Files:**
- Create: `src/logic/calculateSubsidy.ts`
- Create: `src/logic/calculateSubsidy.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/logic/calculateSubsidy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  calculateDailySubsidy,
  getDailySummary,
  getMonthlySummary,
} from './calculateSubsidy'
import type { PurchaseEntry } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'

const scheme: SchemeSetting = {
  subsidyRate: 0.6,
  dailyCap: 200,
  monthlyCap: 1000,
  currency: 'THB',
  updatedAt: '',
}

function makeEntry(amount: number, createdAt: string, date = '2026-05-30'): PurchaseEntry {
  return {
    id: createdAt,
    date,
    month: date.slice(0, 7),
    amount,
    createdAt,
    updatedAt: createdAt,
  }
}

describe('calculateDailySubsidy', () => {
  it('calculates 60% subsidy for basic purchase', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 0)
    expect(result[0].subsidyAmount).toBe(60)
    expect(result[0].userPaidAmount).toBe(40)
  })

  it('caps subsidy at dailyCap', () => {
    // 400 × 0.6 = 240, but dailyCap = 200
    const entries = [makeEntry(400, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 0)
    expect(result[0].subsidyAmount).toBe(200)
    expect(result[0].userPaidAmount).toBe(200)
  })

  it('uses remaining daily cap for subsequent entries', () => {
    // Entry 1: 200 × 0.6 = 120 → remainingDaily = 80
    // Entry 2: 200 × 0.6 = 120, but only 80 remaining → subsidy = 80
    const entries = [
      makeEntry(200, '2026-05-30T09:00:00.000Z'),
      makeEntry(200, '2026-05-30T10:00:00.000Z'),
    ]
    const result = calculateDailySubsidy(entries, scheme, 0)
    expect(result[0].subsidyAmount).toBe(120)
    expect(result[1].subsidyAmount).toBe(80)
    expect(result[1].userPaidAmount).toBe(120)
  })

  it('caps at monthly cap when monthly remaining is lower', () => {
    // monthUsedBefore = 980, monthlyCap = 1000, remaining = 20
    // 100 × 0.6 = 60, but monthlyRemaining = 20
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 980)
    expect(result[0].subsidyAmount).toBe(20)
    expect(result[0].userPaidAmount).toBe(80)
  })

  it('gives zero subsidy when both caps exhausted', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 1000)
    expect(result[0].subsidyAmount).toBe(0)
    expect(result[0].userPaidAmount).toBe(100)
  })
})

describe('getDailySummary', () => {
  it('returns correct totals and remainders', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0)
    expect(summary.totalAmount).toBe(100)
    expect(summary.totalSubsidy).toBe(60)
    expect(summary.totalUserPaid).toBe(40)
    expect(summary.remainingDaily).toBe(140)
    expect(summary.remainingMonthly).toBe(940)
  })

  it('calculates toFillDaily correctly', () => {
    // After 100 baht purchase: remainingDaily = 140, remainingMonthly = 940
    // min(140, 940) = 140, ceil(140 / 0.6) = ceil(233.33) = 234
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0)
    expect(summary.toFillDaily).toBe(234)
  })

  it('toFillDaily uses monthly remaining when it is lower', () => {
    // monthUsedBefore = 880, after 100 baht: monthlyUsed = 880+60 = 940, remaining = 60
    // remainingDaily = 140, remainingMonthly = 60
    // min(140, 60) = 60, ceil(60 / 0.6) = 100
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 880)
    expect(summary.toFillDaily).toBe(100)
  })

  it('returns toFillDaily = 0 when daily cap exhausted', () => {
    const entries = [makeEntry(400, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0)
    expect(summary.toFillDaily).toBe(0)
    expect(summary.remainingDaily).toBe(0)
  })

  it('sorts entries by createdAt before calculating', () => {
    // Entry added out of order — later createdAt should be processed second
    const entries = [
      makeEntry(200, '2026-05-30T11:00:00.000Z'), // processed 2nd
      makeEntry(200, '2026-05-30T09:00:00.000Z'), // processed 1st
    ]
    const summary = getDailySummary(entries, scheme, 0)
    // First (09:00): 200×0.6=120 subsidy, remaining=80
    // Second (11:00): 200×0.6=120, capped at 80
    expect(summary.totalSubsidy).toBe(200)
  })
})

describe('getMonthlySummary', () => {
  it('aggregates across multiple days respecting running monthly cap', () => {
    // Day 1: 400 baht → subsidy 200 (capped at daily)
    // Day 2: 400 baht → subsidy 200 (capped at daily), monthlyUsed = 400
    // Day 3: 400 baht → subsidy 200, monthlyUsed = 600
    // Day 4: 400 baht → subsidy 200, monthlyUsed = 800
    // Day 5: 400 baht → subsidy 200, monthlyUsed = 1000 (monthly cap hit)
    // Day 6: 400 baht → subsidy 0 (monthly cap exhausted)
    const entries: PurchaseEntry[] = []
    for (let day = 1; day <= 6; day++) {
      const dateStr = `2026-05-${String(day).padStart(2, '0')}`
      entries.push(makeEntry(400, `2026-05-${String(day).padStart(2, '0')}T10:00:00.000Z`, dateStr))
    }
    const summary = getMonthlySummary(entries, scheme)
    expect(summary.totalSubsidy).toBe(1000)
    expect(summary.remainingMonthly).toBe(0)
    expect(summary.totalAmount).toBe(2400)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run src/logic/calculateSubsidy.test.ts
```

Expected: FAIL — `Cannot find module './calculateSubsidy'`

- [ ] **Step 3: Create `src/logic/calculateSubsidy.ts`**

```ts
import type { PurchaseEntry, EnrichedEntry, DailySummary, MonthlySummary } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'

export function calculateDailySubsidy(
  entries: PurchaseEntry[],
  setting: SchemeSetting,
  monthUsedBefore: number,
): EnrichedEntry[] {
  let runningDaily = 0
  let runningMonthly = monthUsedBefore

  return entries.map((entry) => {
    const remainingDaily = setting.dailyCap - runningDaily
    const remainingMonthly = setting.monthlyCap - runningMonthly
    const proportional = entry.amount * setting.subsidyRate
    const subsidyAmount = Math.min(proportional, remainingDaily, remainingMonthly, entry.amount)
    const userPaidAmount = entry.amount - subsidyAmount

    runningDaily += subsidyAmount
    runningMonthly += subsidyAmount

    return { ...entry, subsidyAmount, userPaidAmount }
  })
}

export function getDailySummary(
  entries: PurchaseEntry[],
  setting: SchemeSetting,
  monthUsedBefore: number,
): DailySummary {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const enriched = calculateDailySubsidy(sorted, setting, monthUsedBefore)

  const totalSubsidy = enriched.reduce((sum, e) => sum + e.subsidyAmount, 0)
  const totalAmount = enriched.reduce((sum, e) => sum + e.amount, 0)
  const totalUserPaid = totalAmount - totalSubsidy

  const remainingDaily = Math.max(0, setting.dailyCap - totalSubsidy)
  const remainingMonthly = Math.max(0, setting.monthlyCap - monthUsedBefore - totalSubsidy)
  const effectiveRemaining = Math.min(remainingDaily, remainingMonthly)
  const toFillDaily = effectiveRemaining > 0 ? Math.ceil(effectiveRemaining / setting.subsidyRate) : 0

  return { totalAmount, totalSubsidy, totalUserPaid, remainingDaily, remainingMonthly, toFillDaily, entries: enriched }
}

export function getMonthlySummary(
  allMonthEntries: PurchaseEntry[],
  setting: SchemeSetting,
): MonthlySummary {
  const byDate = new Map<string, PurchaseEntry[]>()
  for (const entry of allMonthEntries) {
    if (!byDate.has(entry.date)) byDate.set(entry.date, [])
    byDate.get(entry.date)!.push(entry)
  }

  const sortedDates = [...byDate.keys()].sort()
  let runningMonthly = 0
  let totalAmount = 0

  for (const date of sortedDates) {
    const dayEntries = [...byDate.get(date)!].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const enriched = calculateDailySubsidy(dayEntries, setting, runningMonthly)
    for (const e of enriched) {
      runningMonthly += e.subsidyAmount
      totalAmount += e.amount
    }
  }

  const totalSubsidy = runningMonthly
  const totalUserPaid = totalAmount - totalSubsidy
  const remainingMonthly = Math.max(0, setting.monthlyCap - totalSubsidy)

  return { totalAmount, totalSubsidy, totalUserPaid, remainingMonthly }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run src/logic/calculateSubsidy.test.ts
```

Expected: All 9 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/logic/calculateSubsidy.ts src/logic/calculateSubsidy.test.ts
git commit -m "feat: add subsidy calculation logic with tests"
```

---

## Task 4: Core Logic — formatThai (TDD)

**Files:**
- Create: `src/logic/formatThai.ts`
- Create: `src/logic/formatThai.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/logic/formatThai.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  toBuddhistYear,
  formatThaiDate,
  formatThaiMonth,
  formatAmount,
  dateToMonth,
} from './formatThai'

describe('toBuddhistYear', () => {
  it('converts CE year to Buddhist Era', () => {
    expect(toBuddhistYear(2026)).toBe(2569)
    expect(toBuddhistYear(2000)).toBe(2543)
  })
})

describe('formatThaiDate', () => {
  it('formats date in Thai with พ.ศ. year', () => {
    expect(formatThaiDate('2026-05-30')).toBe('30 พ.ค. 2569')
  })

  it('formats January correctly', () => {
    expect(formatThaiDate('2026-01-01')).toBe('1 ม.ค. 2569')
  })

  it('formats December correctly', () => {
    expect(formatThaiDate('2026-12-31')).toBe('31 ธ.ค. 2569')
  })
})

describe('formatThaiMonth', () => {
  it('formats month in Thai with พ.ศ. year', () => {
    expect(formatThaiMonth('2026-05')).toBe('พ.ค. 2569')
  })
})

describe('formatAmount', () => {
  it('formats numbers with thousand separator', () => {
    expect(formatAmount(1234)).toBe('1,234')
    expect(formatAmount(200)).toBe('200')
  })
})

describe('dateToMonth', () => {
  it('extracts month key from date key', () => {
    expect(dateToMonth('2026-05-30')).toBe('2026-05')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npx vitest run src/logic/formatThai.test.ts
```

Expected: FAIL — `Cannot find module './formatThai'`

- [ ] **Step 3: Create `src/logic/formatThai.ts`**

```ts
export const THAI_MONTHS = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
]

export function toBuddhistYear(ceYear: number): number {
  return ceYear + 543
}

export function formatThaiDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${day} ${THAI_MONTHS[month - 1]} ${toBuddhistYear(year)}`
}

export function formatThaiMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-').map(Number)
  return `${THAI_MONTHS[month - 1]} ${toBuddhistYear(year)}`
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function thisMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function dateToMonth(dateKey: string): string {
  return dateKey.slice(0, 7)
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npx vitest run src/logic/formatThai.test.ts
```

Expected: All 6 tests pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/logic/
git commit -m "feat: add Thai date/amount formatting utilities with tests"
```

---

## Task 5: Database Layer

**Files:**
- Create: `src/db/db.ts`
- Create: `src/db/purchaseRepository.ts`
- Create: `src/db/settingRepository.ts`

- [ ] **Step 1: Create `src/db/db.ts`**

```ts
import Dexie, { type Table } from 'dexie'
import type { PurchaseEntry } from '../types/purchase'

type SettingRecord = { key: string; value: unknown }

export class AppDatabase extends Dexie {
  purchases!: Table<PurchaseEntry>
  settings!: Table<SettingRecord>

  constructor() {
    super('jod-lakhrueng-plus')
    this.version(1).stores({
      purchases: 'id, date, month, createdAt',
      settings: 'key',
    })
  }
}

export const db = new AppDatabase()
```

- [ ] **Step 2: Create `src/db/purchaseRepository.ts`**

```ts
import { nanoid } from 'nanoid'
import { db } from './db'
import type { PurchaseEntry } from '../types/purchase'
import { todayKey, thisMonthKey, dateToMonth } from '../logic/formatThai'

type NewPurchase = Omit<PurchaseEntry, 'id' | 'date' | 'month' | 'createdAt' | 'updatedAt'> & {
  date?: string
}

export async function addPurchase(data: NewPurchase): Promise<PurchaseEntry> {
  const now = new Date().toISOString()
  const date = data.date ?? todayKey()
  const entry: PurchaseEntry = {
    ...data,
    id: nanoid(),
    date,
    month: dateToMonth(date),
    createdAt: now,
    updatedAt: now,
  }
  await db.purchases.add(entry)
  return entry
}

export async function getPurchasesByDate(date: string): Promise<PurchaseEntry[]> {
  return db.purchases.where('date').equals(date).toArray()
}

export async function getPurchasesByMonth(month: string): Promise<PurchaseEntry[]> {
  return db.purchases.where('month').equals(month).toArray()
}

export async function getRecentPurchases(limit: number): Promise<PurchaseEntry[]> {
  return db.purchases.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function updatePurchase(
  id: string,
  data: Partial<Omit<PurchaseEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.purchases.update(id, { ...data, updatedAt: new Date().toISOString() })
}

export async function deletePurchase(id: string): Promise<void> {
  await db.purchases.delete(id)
}

export async function getAllPurchases(): Promise<PurchaseEntry[]> {
  return db.purchases.orderBy('createdAt').toArray()
}

export async function clearAllPurchases(): Promise<void> {
  await db.purchases.clear()
}
```

- [ ] **Step 3: Create `src/db/settingRepository.ts`**

```ts
import { db } from './db'
import type { SchemeSetting, AppSetting } from '../types/setting'
import { DEFAULT_SCHEME, DEFAULT_APP } from '../types/setting'

export async function getSchemeSetting(): Promise<SchemeSetting> {
  const record = await db.settings.get('scheme')
  return (record?.value as SchemeSetting) ?? { ...DEFAULT_SCHEME, updatedAt: new Date().toISOString() }
}

export async function saveSchemeSetting(setting: Omit<SchemeSetting, 'updatedAt'>): Promise<void> {
  await db.settings.put({ key: 'scheme', value: { ...setting, updatedAt: new Date().toISOString() } })
}

export async function getAppSetting(): Promise<AppSetting> {
  const record = await db.settings.get('app')
  return (record?.value as AppSetting) ?? { ...DEFAULT_APP, updatedAt: new Date().toISOString() }
}

export async function saveAppSetting(setting: Omit<AppSetting, 'updatedAt'>): Promise<void> {
  await db.settings.put({ key: 'app', value: { ...setting, updatedAt: new Date().toISOString() } })
}
```

- [ ] **Step 4: Commit**

```bash
git add src/db/
git commit -m "feat: add Dexie database layer with purchase and setting repositories"
```

---

## Task 6: App Shell — Routing + Bottom Nav

**Files:**
- Modify: `src/main.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 1: Replace `src/App.tsx` with full router setup**

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import AddPurchasePage from './pages/AddPurchasePage'

const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-500">กำลังโหลด...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddPurchasePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Create `src/components/BottomNav.tsx`**

```tsx
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'หน้าแรก', icon: '🏠' },
  { to: '/history', label: 'ประวัติ', icon: '📋' },
  { to: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      aria-label="เมนูหลัก"
    >
      <div className="flex">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-sm font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
            aria-label={label}
          >
            <span className="text-xl leading-none mb-1" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create stub pages to satisfy imports**

Create `src/pages/HomePage.tsx`:
```tsx
export default function HomePage() {
  return <div className="p-4">หน้าแรก</div>
}
```

Create `src/pages/AddPurchasePage.tsx`:
```tsx
export default function AddPurchasePage() {
  return <div className="p-4">จดรายการซื้อ</div>
}
```

Create `src/pages/HistoryPage.tsx`:
```tsx
export default function HistoryPage() {
  return <div className="p-4">ประวัติ</div>
}
```

Create `src/pages/SettingsPage.tsx`:
```tsx
export default function SettingsPage() {
  return <div className="p-4">ตั้งค่า</div>
}
```

Create `src/pages/PrivacyPage.tsx`:
```tsx
export default function PrivacyPage() {
  return <div className="p-4">นโยบายความเป็นส่วนตัว</div>
}
```

- [ ] **Step 4: Verify app shell works**

```bash
npm run dev
```

Expected: App loads with bottom nav. Tabs navigate between stub pages. No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: add app shell with React Router and bottom navigation"
```

---

## Task 7: Hooks

**Files:**
- Create: `src/hooks/useSettings.ts`
- Create: `src/hooks/useCampaignStatus.ts`
- Create: `src/hooks/useDailySummary.ts`
- Create: `src/hooks/useMonthlySummary.ts`

- [ ] **Step 1: Create `src/hooks/useSettings.ts`**

```ts
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { SchemeSetting, AppSetting } from '../types/setting'
import { DEFAULT_SCHEME, DEFAULT_APP } from '../types/setting'

export function useSchemeSetting(): SchemeSetting {
  return useLiveQuery(async () => {
    const record = await db.settings.get('scheme')
    return (record?.value as SchemeSetting) ?? { ...DEFAULT_SCHEME, updatedAt: new Date().toISOString() }
  }) ?? { ...DEFAULT_SCHEME, updatedAt: '' }
}

export function useAppSetting(): AppSetting {
  return useLiveQuery(async () => {
    const record = await db.settings.get('app')
    return (record?.value as AppSetting) ?? { ...DEFAULT_APP, updatedAt: new Date().toISOString() }
  }) ?? { ...DEFAULT_APP, updatedAt: '' }
}
```

- [ ] **Step 2: Create `src/hooks/useCampaignStatus.ts`**

```ts
import { useSchemeSetting } from './useSettings'
import { todayKey } from '../logic/formatThai'

export type CampaignStatus = 'before' | 'active' | 'after' | 'unrestricted'

export function useCampaignStatus(): { status: CampaignStatus; startDate?: string; endDate?: string } {
  const scheme = useSchemeSetting()
  const today = todayKey()

  if (!scheme.startDate && !scheme.endDate) return { status: 'unrestricted' }

  if (scheme.startDate && today < scheme.startDate) {
    return { status: 'before', startDate: scheme.startDate }
  }
  if (scheme.endDate && today > scheme.endDate) {
    return { status: 'after', endDate: scheme.endDate }
  }
  return { status: 'active', startDate: scheme.startDate, endDate: scheme.endDate }
}
```

- [ ] **Step 3: Create `src/hooks/useDailySummary.ts`**

```ts
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getDailySummary, getMonthlySummary } from '../logic/calculateSubsidy'
import { todayKey, thisMonthKey } from '../logic/formatThai'
import type { SchemeSetting } from '../types/setting'
import type { DailySummary } from '../types/purchase'

export function useDailySummary(scheme: SchemeSetting): DailySummary | undefined {
  return useLiveQuery(async () => {
    const today = todayKey()
    const thisMonth = thisMonthKey()

    const [dayEntries, allMonthEntries] = await Promise.all([
      db.purchases.where('date').equals(today).toArray(),
      db.purchases.where('month').equals(thisMonth).toArray(),
    ])

    const priorDayEntries = allMonthEntries.filter((e) => e.date < today)
    const { totalSubsidy: monthUsedBefore } = getMonthlySummary(priorDayEntries, scheme)

    return getDailySummary(dayEntries, scheme, monthUsedBefore)
  }, [scheme.subsidyRate, scheme.dailyCap, scheme.monthlyCap])
}
```

- [ ] **Step 4: Create `src/hooks/useMonthlySummary.ts`**

```ts
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getMonthlySummary } from '../logic/calculateSubsidy'
import { thisMonthKey } from '../logic/formatThai'
import type { SchemeSetting } from '../types/setting'
import type { MonthlySummary } from '../types/purchase'

export function useMonthlySummary(
  scheme: SchemeSetting,
  month?: string,
): MonthlySummary | undefined {
  return useLiveQuery(async () => {
    const targetMonth = month ?? thisMonthKey()
    const entries = await db.purchases.where('month').equals(targetMonth).toArray()
    return getMonthlySummary(entries, scheme)
  }, [scheme.subsidyRate, scheme.monthlyCap, month])
}
```

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add reactive hooks for settings, campaign status, daily and monthly summaries"
```

---

## Task 8: Home Page

**Files:**
- Create: `src/components/TodaySummaryCard.tsx`
- Create: `src/components/MonthSummaryCard.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/components/CampaignLockScreen.tsx`
- Create: `src/components/InstallHint.tsx`
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: Create `src/components/EmptyState.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'

interface Props {
  message: string
  subMessage?: string
  showAddButton?: boolean
}

export default function EmptyState({ message, subMessage, showAddButton = false }: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <p className="text-xl text-gray-600 font-medium">{message}</p>
      {subMessage && <p className="mt-2 text-gray-400 text-lg">{subMessage}</p>}
      {showAddButton && (
        <button
          onClick={() => navigate('/add')}
          className="mt-6 bg-blue-600 text-white text-xl font-semibold px-8 py-4 rounded-2xl min-h-[56px] shadow-md active:opacity-80"
        >
          + จดรายการซื้อ
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/TodaySummaryCard.tsx`**

```tsx
import type { DailySummary } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  summary: DailySummary
  dailyCap: number
}

function getStatus(remaining: number, cap: number) {
  if (remaining === 0) return { color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', label: 'วันนี้เต็มสิทธิแล้ว' }
  if (remaining / cap < 0.5) return { color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700', label: 'ใกล้เต็มวันนี้แล้ว' }
  return { color: 'bg-green-50 border-green-200', textColor: 'text-green-700', label: 'ยังใช้ได้อีก' }
}

export default function TodaySummaryCard({ summary, dailyCap }: Props) {
  const status = getStatus(summary.remainingDaily, dailyCap)

  return (
    <div className={`rounded-2xl border-2 p-5 ${status.color}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-700">วันนี้</h2>
        <span className={`text-base font-medium px-3 py-1 rounded-full ${status.textColor} bg-white`}>
          {status.label}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-base">ใช้สิทธิไปแล้ว</p>
        <p className="text-5xl font-bold text-gray-800 leading-tight">
          {formatAmount(summary.totalSubsidy)}
          <span className="text-2xl font-normal text-gray-400"> / {formatAmount(dailyCap)} บาท</span>
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all ${summary.remainingDaily === 0 ? 'bg-blue-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(100, (summary.totalSubsidy / dailyCap) * 100)}%` }}
          role="progressbar"
          aria-valuenow={summary.totalSubsidy}
          aria-valuemin={0}
          aria-valuemax={dailyCap}
          aria-label={`ใช้สิทธิแล้ว ${summary.totalSubsidy} จาก ${dailyCap} บาท`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <p className="text-gray-500 text-sm">วันนี้เหลืออีก</p>
          <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.remainingDaily)} <span className="text-base font-normal">บาท</span></p>
        </div>
        {summary.toFillDaily > 0 && (
          <div className="bg-white rounded-xl p-3">
            <p className="text-gray-500 text-sm">ซื้อเพิ่มอีกประมาณ</p>
            <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.toFillDaily)} <span className="text-base font-normal">บาท</span></p>
            <p className="text-xs text-gray-400">จะเต็มสิทธิวันนี้</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/MonthSummaryCard.tsx`**

```tsx
import type { MonthlySummary } from '../types/purchase'
import { formatAmount, formatThaiMonth, thisMonthKey } from '../logic/formatThai'

interface Props {
  summary: MonthlySummary
  monthlyCap: number
  month?: string
}

export default function MonthSummaryCard({ summary, monthlyCap, month }: Props) {
  const displayMonth = month ?? thisMonthKey()
  const pct = Math.min(100, (summary.totalSubsidy / monthlyCap) * 100)
  const isLow = summary.remainingMonthly > 0 && summary.remainingMonthly / monthlyCap < 0.2

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-700">เดือนนี้</h2>
        <span className="text-base text-gray-400">{formatThaiMonth(displayMonth)}</span>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-base">ใช้สิทธิไปแล้ว</p>
        <p className="text-4xl font-bold text-gray-800 leading-tight">
          {formatAmount(summary.totalSubsidy)}
          <span className="text-xl font-normal text-gray-400"> / {formatAmount(monthlyCap)} บาท</span>
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${isLow ? 'bg-orange-400' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={summary.totalSubsidy}
          aria-valuemin={0}
          aria-valuemax={monthlyCap}
          aria-label={`ใช้สิทธิเดือนนี้แล้ว ${summary.totalSubsidy} จาก ${monthlyCap} บาท`}
        />
      </div>

      <div className="flex justify-between text-base">
        <span className="text-gray-500">
          เหลืออีก <span className={`font-semibold ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>{formatAmount(summary.remainingMonthly)} บาท</span>
        </span>
        {isLow && <span className="text-orange-600 font-medium">เดือนนี้เหลือสิทธิน้อยแล้ว</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/CampaignLockScreen.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import type { CampaignStatus } from '../hooks/useCampaignStatus'
import { formatThaiDate } from '../logic/formatThai'

interface Props {
  status: CampaignStatus
  startDate?: string
  endDate?: string
}

export default function CampaignLockScreen({ status, startDate, endDate }: Props) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="text-6xl mb-6" aria-hidden="true">
        {status === 'before' ? '⏳' : '✅'}
      </div>
      {status === 'before' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">โครงการยังไม่เริ่ม</h1>
          {startDate && (
            <p className="text-xl text-gray-600">จะเริ่มวันที่ {formatThaiDate(startDate)}</p>
          )}
        </>
      )}
      {status === 'after' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">โครงการสิ้นสุดแล้ว</h1>
          {endDate && (
            <p className="text-xl text-gray-600 mb-6">สิ้นสุดวันที่ {formatThaiDate(endDate)}</p>
          )}
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-600 text-white text-xl font-semibold px-8 py-4 rounded-2xl min-h-[56px]"
          >
            ดูประวัติการซื้อ
          </button>
        </>
      )}
      <p className="mt-6 text-base text-gray-400">
        สามารถแก้ไขวันที่โครงการได้ที่หน้าตั้งค่า
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/InstallHint.tsx`**

```tsx
interface Props {
  onDismiss: () => void
}

export default function InstallHint({ onDismiss }: Props) {
  return (
    <div className="mx-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
      <span className="text-2xl" aria-hidden="true">📱</span>
      <div className="flex-1">
        <p className="text-base font-medium text-blue-800">เพิ่มเว็บนี้ไว้หน้าจอมือถือ</p>
        <p className="text-sm text-blue-600 mt-1">เพื่อจดรายการได้เร็วขึ้น ไม่ต้องเปิด browser ทุกครั้ง</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-blue-400 text-xl p-1"
        aria-label="ปิดคำแนะนำ"
      >
        ✕
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Replace `src/pages/HomePage.tsx` with full implementation**

```tsx
import { useNavigate } from 'react-router-dom'
import { useSchemeSetting, useAppSetting } from '../hooks/useSettings'
import { useCampaignStatus } from '../hooks/useCampaignStatus'
import { useDailySummary } from '../hooks/useDailySummary'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveAppSetting } from '../db/settingRepository'
import TodaySummaryCard from '../components/TodaySummaryCard'
import MonthSummaryCard from '../components/MonthSummaryCard'
import EmptyState from '../components/EmptyState'
import CampaignLockScreen from '../components/CampaignLockScreen'
import InstallHint from '../components/InstallHint'
import { formatThaiDate, formatAmount } from '../logic/formatThai'

export default function HomePage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const appSetting = useAppSetting()
  const { status, startDate, endDate } = useCampaignStatus()
  const dailySummary = useDailySummary(scheme)
  const monthlySummary = useMonthlySummary(scheme)
  const recentEntries = useLiveQuery(() => db.purchases.orderBy('createdAt').reverse().limit(3).toArray(), [])

  async function dismissInstallHint() {
    await saveAppSetting({ ...appSetting, showInstallHint: false })
  }

  if (status === 'before' || status === 'after') {
    return (
      <div className="max-w-md mx-auto">
        <header className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-800">จดละครึ่ง พลัส</h1>
          <p className="text-sm text-gray-400 mt-1">เครื่องมือช่วยจดสิทธิโครงการคนละครึ่ง พลัส</p>
        </header>
        <CampaignLockScreen status={status} startDate={startDate} endDate={endDate} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-800">จดละครึ่ง พลัส</h1>
        <p className="text-sm text-gray-400 mt-1">เครื่องมือช่วยจดสิทธิโครงการคนละครึ่ง พลัส</p>
      </header>

      {appSetting.showInstallHint && <InstallHint onDismiss={dismissInstallHint} />}

      <div className="px-4 space-y-4">
        {dailySummary ? (
          <TodaySummaryCard summary={dailySummary} dailyCap={scheme.dailyCap} />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 h-40 animate-pulse" />
        )}

        <button
          onClick={() => navigate('/add')}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-2xl font-bold py-5 rounded-2xl min-h-[72px] shadow-lg transition-colors"
          aria-label="จดรายการซื้อใหม่"
        >
          + จดรายการซื้อ
        </button>

        {monthlySummary ? (
          <MonthSummaryCard summary={monthlySummary} monthlyCap={scheme.monthlyCap} />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 h-32 animate-pulse" />
        )}

        {/* Recent entries */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">รายการล่าสุด</h2>
          {!recentEntries || recentEntries.length === 0 ? (
            <EmptyState
              message="วันนี้ยังไม่มีรายการซื้อ"
              subMessage="กดปุ่มด้านบนเพื่อจดรายการแรกของวันนี้"
            />
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">{entry.title ?? 'ไม่ระบุชื่อ'}</p>
                    <p className="text-sm text-gray-400">{formatThaiDate(entry.date)}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{formatAmount(entry.amount)} บาท</p>
                </div>
              ))}
              <button
                onClick={() => navigate('/history')}
                className="w-full text-center text-blue-600 font-medium py-3 text-lg"
              >
                ดูประวัติทั้งหมด →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify home page renders correctly**

```bash
npm run dev
```

Expected: Home page shows summary cards, big blue "จดรายการซื้อ" button, recent entries section. No console errors.

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: implement home page with daily/monthly summary cards"
```

---

## Task 9: Add Purchase Page

**Files:**
- Create: `src/components/AmountShortcutGrid.tsx`
- Create: `src/components/QuickRepeatButtons.tsx`
- Create: `src/components/ConfirmDialog.tsx`
- Modify: `src/pages/AddPurchasePage.tsx`

- [ ] **Step 1: Create `src/components/ConfirmDialog.tsx`**

```tsx
interface Props {
  message: string
  subMessage?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  message,
  subMessage,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
        <p className="text-xl font-semibold text-gray-800 text-center">{message}</p>
        {subMessage && <p className="text-base text-gray-500 text-center mt-2">{subMessage}</p>}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-700 text-lg font-medium min-h-[56px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-lg font-semibold min-h-[56px]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/AmountShortcutGrid.tsx`**

```tsx
import { formatAmount } from '../logic/formatThai'

const PRESET_AMOUNTS = [50, 60, 80, 100, 120, 150, 200, 333]

interface Props {
  toFillToday: number
  onSelect: (amount: number) => void
}

export default function AmountShortcutGrid({ toFillToday, onSelect }: Props) {
  return (
    <div>
      <p className="text-base text-gray-500 mb-2">กดเลือกยอดได้เลย</p>
      <div className="grid grid-cols-4 gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className="bg-gray-100 hover:bg-blue-50 active:bg-blue-100 text-gray-800 font-semibold rounded-xl py-3 text-base min-h-[48px] transition-colors"
          >
            {formatAmount(amount)}
          </button>
        ))}
        {toFillToday > 0 && (
          <button
            onClick={() => onSelect(toFillToday)}
            className="col-span-4 bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-800 font-semibold rounded-xl py-3 text-base min-h-[48px] border border-green-200 transition-colors"
          >
            เต็มสิทธิวันนี้ ({formatAmount(toFillToday)} บาท)
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/QuickRepeatButtons.tsx`**

```tsx
import type { PurchaseEntry } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  entries: PurchaseEntry[]
  onSelect: (entry: PurchaseEntry) => void
}

export default function QuickRepeatButtons({ entries, onSelect }: Props) {
  if (entries.length === 0) return null

  return (
    <div>
      <p className="text-base text-gray-500 mb-2">จดซ้ำจากที่ผ่านมา</p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center min-h-[56px] transition-colors"
          >
            <span className="text-base text-gray-700">{entry.title ?? 'ไม่ระบุชื่อ'}</span>
            <span className="text-lg font-semibold text-gray-800">{formatAmount(entry.amount)} บาท</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Replace `src/pages/AddPurchasePage.tsx` with full implementation**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { addPurchase } from '../db/purchaseRepository'
import { useSchemeSetting } from '../hooks/useSettings'
import { useDailySummary } from '../hooks/useDailySummary'
import { getMonthlySummary } from '../logic/calculateSubsidy'
import { formatAmount, thisMonthKey, todayKey } from '../logic/formatThai'
import { CATEGORY_LABELS, type PurchaseCategory } from '../types/purchase'
import AmountShortcutGrid from '../components/AmountShortcutGrid'
import QuickRepeatButtons from '../components/QuickRepeatButtons'
import ConfirmDialog from '../components/ConfirmDialog'
import type { PurchaseEntry } from '../types/purchase'

type SavedFeedback = { subsidyAmount: number; userPaidAmount: number } | null

export default function AddPurchasePage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const dailySummary = useDailySummary(scheme)
  const recentEntries = useLiveQuery(() => db.purchases.orderBy('createdAt').reverse().limit(3).toArray(), [])

  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PurchaseCategory | ''>('')
  const [error, setError] = useState('')
  const [savedFeedback, setSavedFeedback] = useState<SavedFeedback>(null)
  const [showLargeConfirm, setShowLargeConfirm] = useState(false)

  const numAmount = parseFloat(amount) || 0
  const toFillToday = dailySummary?.toFillDaily ?? 0

  function handleAmountInput(value: string) {
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setAmount(cleaned)
    setError('')
  }

  function handleShortcut(value: number) {
    setAmount(String(value))
    setError('')
  }

  function handleQuickRepeat(entry: PurchaseEntry) {
    setAmount(String(entry.amount))
    setTitle(entry.title ?? '')
    setCategory((entry.category as PurchaseCategory) ?? '')
  }

  async function doSave() {
    const monthEntries = await db.purchases.where('month').equals(thisMonthKey()).toArray()
    const priorEntries = monthEntries.filter((e) => e.date < todayKey())
    const { totalSubsidy: monthUsedBefore } = getMonthlySummary(priorEntries, scheme)

    const dayEntries = await db.purchases.where('date').equals(todayKey()).toArray()
    const currentDailyUsed = dayEntries.reduce((sum, e) => {
      const proportional = e.amount * scheme.subsidyRate
      return sum + Math.min(proportional, scheme.dailyCap - sum, scheme.monthlyCap - monthUsedBefore - sum)
    }, 0)

    const remainingDaily = Math.max(0, scheme.dailyCap - currentDailyUsed)
    const remainingMonthly = Math.max(0, scheme.monthlyCap - monthUsedBefore - currentDailyUsed)
    const proportional = numAmount * scheme.subsidyRate
    const subsidyAmount = Math.min(proportional, remainingDaily, remainingMonthly, numAmount)
    const userPaidAmount = numAmount - subsidyAmount

    await addPurchase({
      amount: numAmount,
      title: title.trim() || undefined,
      category: category || undefined,
    })

    setSavedFeedback({ subsidyAmount, userPaidAmount })
  }

  async function handleSave() {
    if (numAmount <= 0) {
      setError('กรุณาใส่ยอดซื้อ')
      return
    }
    if (numAmount > 50000) {
      setShowLargeConfirm(true)
      return
    }
    await doSave()
  }

  if (savedFeedback) {
    return (
      <div className="max-w-md mx-auto px-4 pt-12 flex flex-col items-center text-center">
        <div className="text-6xl mb-4" aria-hidden="true">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">บันทึกแล้ว</h1>
        <p className="text-xl text-gray-600 mb-1">รัฐช่วย <span className="font-bold text-green-600">{formatAmount(savedFeedback.subsidyAmount)} บาท</span></p>
        <p className="text-xl text-gray-600 mb-8">คุณจ่ายเอง <span className="font-bold text-gray-800">{formatAmount(savedFeedback.userPaidAmount)} บาท</span></p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSavedFeedback(null); setAmount(''); setTitle(''); setCategory('') }}
            className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            จดเพิ่มอีก
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl p-2 -ml-2 text-gray-600"
          aria-label="ย้อนกลับ"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-800">จดรายการซื้อ</h1>
      </header>

      <div className="px-4 space-y-5">
        {/* Amount input */}
        <div>
          <label htmlFor="amount" className="text-base text-gray-500 mb-1 block">
            ยอดซื้อ (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => handleAmountInput(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full text-4xl font-bold text-gray-800 border-2 border-gray-300 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none text-center"
            aria-describedby={error ? 'amount-error' : undefined}
          />
          {error && <p id="amount-error" className="text-red-500 text-base mt-1">{error}</p>}
        </div>

        <AmountShortcutGrid toFillToday={toFillToday} onSelect={handleShortcut} />

        {recentEntries && recentEntries.length > 0 && (
          <QuickRepeatButtons entries={recentEntries} onSelect={handleQuickRepeat} />
        )}

        {/* Optional title */}
        <div>
          <label htmlFor="title" className="text-base text-gray-500 mb-1 block">
            ชื่อรายการ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ข้าวแกง กาแฟ"
            className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Optional category */}
        <div>
          <label htmlFor="category" className="text-base text-gray-500 mb-1 block">
            หมวดหมู่ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PurchaseCategory | '')}
            className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {(Object.entries(CATEGORY_LABELS) as [PurchaseCategory, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px] shadow-md"
          >
            บันทึก
          </button>
        </div>
      </div>

      {showLargeConfirm && (
        <ConfirmDialog
          message={`ยืนยันยอด ${formatAmount(numAmount)} บาท?`}
          subMessage="ยอดนี้สูงกว่าปกติ ต้องการบันทึกหรือไม่?"
          confirmLabel="บันทึก"
          onConfirm={async () => { setShowLargeConfirm(false); await doSave() }}
          onCancel={() => setShowLargeConfirm(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 5: Test Add flow manually**

```bash
npm run dev
```

Navigate to `/add`. Expected:
- Amount input autofocuses
- Preset amount buttons fill the input
- "เต็มสิทธิวันนี้" shows only if today has remaining subsidy
- Saving shows feedback screen with subsidy breakdown
- Home page updates after returning

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: implement add purchase page with shortcuts and post-save feedback"
```

---

## Task 10: History Page

**Files:**
- Create: `src/components/PurchaseListItem.tsx`
- Modify: `src/pages/HistoryPage.tsx`

- [ ] **Step 1: Create `src/components/PurchaseListItem.tsx`**

```tsx
import type { EnrichedEntry } from '../types/purchase'
import { CATEGORY_LABELS } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  entry: EnrichedEntry
  onEdit: (entry: EnrichedEntry) => void
  onDelete: (entry: EnrichedEntry) => void
}

export default function PurchaseListItem({ entry, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-800 truncate">
            {entry.title ?? 'ไม่ระบุชื่อ'}
          </p>
          {entry.category && (
            <p className="text-sm text-gray-400">{CATEGORY_LABELS[entry.category]}</p>
          )}
          <div className="flex gap-3 mt-1 text-sm text-gray-500">
            <span>รัฐช่วย <span className="font-medium text-green-600">{formatAmount(entry.subsidyAmount)} บาท</span></span>
            <span>จ่ายเอง <span className="font-medium text-gray-700">{formatAmount(entry.userPaidAmount)} บาท</span></span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-3">
          <p className="text-xl font-bold text-gray-800">{formatAmount(entry.amount)} บาท</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="text-blue-600 text-sm font-medium px-3 py-1 rounded-lg border border-blue-200 min-h-[36px]"
              aria-label={`แก้ไข ${entry.title ?? 'รายการ'}`}
            >
              แก้ไข
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="text-red-500 text-sm font-medium px-3 py-1 rounded-lg border border-red-200 min-h-[36px]"
              aria-label={`ลบ ${entry.title ?? 'รายการ'}`}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `src/pages/HistoryPage.tsx` with full implementation**

```tsx
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { updatePurchase, deletePurchase } from '../db/purchaseRepository'
import { useSchemeSetting } from '../hooks/useSettings'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { getMonthlySummary, calculateDailySubsidy } from '../logic/calculateSubsidy'
import { formatThaiDate, formatThaiMonth, formatAmount, thisMonthKey } from '../logic/formatThai'
import { CATEGORY_LABELS, type PurchaseCategory, type EnrichedEntry } from '../types/purchase'
import PurchaseListItem from '../components/PurchaseListItem'
import ConfirmDialog from '../components/ConfirmDialog'
import MonthSummaryCard from '../components/MonthSummaryCard'
import EmptyState from '../components/EmptyState'
import type { PurchaseEntry } from '../types/purchase'

export default function HistoryPage() {
  const scheme = useSchemeSetting()
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey())
  const [deleteTarget, setDeleteTarget] = useState<EnrichedEntry | null>(null)
  const [editTarget, setEditTarget] = useState<EnrichedEntry | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const monthlySummary = useMonthlySummary(scheme, selectedMonth)

  const monthEntries = useLiveQuery(
    () => db.purchases.where('month').equals(selectedMonth).sortBy('createdAt'),
    [selectedMonth],
  )

  // Get available months for the filter
  const availableMonths = useLiveQuery(async () => {
    const all = await db.purchases.orderBy('month').uniqueKeys()
    return (all as string[]).reverse()
  }, [])

  // Enrich entries with computed subsidy per day
  function enrichEntries(entries: PurchaseEntry[]): EnrichedEntry[] {
    const byDate = new Map<string, PurchaseEntry[]>()
    for (const e of entries) {
      if (!byDate.has(e.date)) byDate.set(e.date, [])
      byDate.get(e.date)!.push(e)
    }
    const sortedDates = [...byDate.keys()].sort()
    let runningMonthly = 0
    const result: EnrichedEntry[] = []
    for (const date of sortedDates) {
      const dayEntries = [...byDate.get(date)!].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const enriched = calculateDailySubsidy(dayEntries, scheme, runningMonthly)
      for (const e of enriched) {
        runningMonthly += e.subsidyAmount
        result.push(e)
      }
    }
    return result
  }

  const enrichedEntries = monthEntries ? enrichEntries(monthEntries) : []

  // Group by date
  const byDate = new Map<string, EnrichedEntry[]>()
  for (const e of enrichedEntries) {
    if (!byDate.has(e.date)) byDate.set(e.date, [])
    byDate.get(e.date)!.push(e)
  }
  const sortedDates = [...byDate.keys()].sort().reverse()

  async function handleDelete() {
    if (!deleteTarget) return
    await deletePurchase(deleteTarget.id)
    setDeleteTarget(null)
  }

  function openEdit(entry: EnrichedEntry) {
    setEditTarget(entry)
    setEditAmount(String(entry.amount))
    setEditTitle(entry.title ?? '')
  }

  async function handleEdit() {
    if (!editTarget) return
    const newAmount = parseFloat(editAmount)
    if (!newAmount || newAmount <= 0) return
    await updatePurchase(editTarget.id, {
      amount: newAmount,
      title: editTitle.trim() || undefined,
    })
    setEditTarget(null)
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">ประวัติการซื้อ</h1>
      </header>

      {/* Month filter */}
      <div className="px-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 bg-white focus:border-blue-500 focus:outline-none"
          aria-label="เลือกเดือน"
        >
          {(availableMonths ?? [thisMonthKey()]).map((month) => (
            <option key={month} value={month}>
              {formatThaiMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly summary */}
      {monthlySummary && (
        <div className="px-4 mb-4">
          <MonthSummaryCard summary={monthlySummary} monthlyCap={scheme.monthlyCap} month={selectedMonth} />
        </div>
      )}

      {/* Entries by day */}
      <div className="px-4 space-y-6 pb-6">
        {sortedDates.length === 0 ? (
          <EmptyState message="ไม่มีรายการในเดือนนี้" />
        ) : (
          sortedDates.map((date) => {
            const dayEntries = byDate.get(date)!
            const dayTotal = dayEntries.reduce((s, e) => s + e.amount, 0)
            const daySubsidy = dayEntries.reduce((s, e) => s + e.subsidyAmount, 0)
            const dayUserPaid = dayEntries.reduce((s, e) => s + e.userPaidAmount, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-700">{formatThaiDate(date)}</h2>
                  <span className="text-sm text-gray-400">รวม {formatAmount(dayTotal)} บาท</span>
                </div>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <PurchaseListItem
                      key={entry.id}
                      entry={entry}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
                <div className="mt-2 px-1 flex gap-4 text-sm text-gray-500">
                  <span>รัฐช่วยรวม <span className="font-medium text-green-600">{formatAmount(daySubsidy)} บาท</span></span>
                  <span>จ่ายเองรวม <span className="font-medium text-gray-700">{formatAmount(dayUserPaid)} บาท</span></span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          message="ลบรายการนี้?"
          subMessage={`${deleteTarget.title ?? 'ไม่ระบุชื่อ'} ${formatAmount(deleteTarget.amount)} บาท`}
          confirmLabel="ลบ"
          cancelLabel="ยกเลิก"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Edit dialog */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">แก้ไขรายการ</h2>
            <div className="space-y-3">
              <div>
                <label className="text-base text-gray-500 block mb-1">ยอดซื้อ (บาท)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full text-2xl font-bold border-2 border-gray-300 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none text-center"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-base text-gray-500 block mb-1">ชื่อรายการ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditTarget(null)} className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold text-lg py-4 rounded-2xl min-h-[56px]">ยกเลิก</button>
              <button onClick={handleEdit} className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px]">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify history page**

```bash
npm run dev
```

Expected: History page shows month filter, monthly summary, entries grouped by day with edit/delete. Delete shows confirmation dialog.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: implement history page with edit/delete and month filter"
```

---

## Task 11: Settings Page

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Replace `src/pages/SettingsPage.tsx` with full implementation**

```tsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchemeSetting, useAppSetting } from '../hooks/useSettings'
import { saveSchemeSetting, saveAppSetting } from '../db/settingRepository'
import { getAllPurchases, clearAllPurchases } from '../db/purchaseRepository'
import { db } from '../db/db'
import { DEFAULT_SCHEME } from '../types/setting'
import ConfirmDialog from '../components/ConfirmDialog'
import type { PurchaseEntry } from '../types/purchase'

export default function SettingsPage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const appSetting = useAppSetting()

  const [subsidyRate, setSubsidyRate] = useState('')
  const [dailyCap, setDailyCap] = useState('')
  const [monthlyCap, setMonthlyCap] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'extra-large'>('normal')
  const [saved, setSaved] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearConfirm2, setShowClearConfirm2] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSubsidyRate(String(scheme.subsidyRate * 100))
    setDailyCap(String(scheme.dailyCap))
    setMonthlyCap(String(scheme.monthlyCap))
    setStartDate(scheme.startDate ?? '')
    setEndDate(scheme.endDate ?? '')
  }, [scheme])

  useEffect(() => {
    setFontSizeMode(appSetting.fontSizeMode)
  }, [appSetting])

  async function handleSaveScheme() {
    await saveSchemeSetting({
      subsidyRate: parseFloat(subsidyRate) / 100 || 0.6,
      dailyCap: parseFloat(dailyCap) || 200,
      monthlyCap: parseFloat(monthlyCap) || 1000,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      currency: 'THB',
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleResetScheme() {
    setSubsidyRate(String(DEFAULT_SCHEME.subsidyRate * 100))
    setDailyCap(String(DEFAULT_SCHEME.dailyCap))
    setMonthlyCap(String(DEFAULT_SCHEME.monthlyCap))
    setStartDate('')
    setEndDate('')
  }

  async function handleSaveFontSize() {
    await saveAppSetting({ ...appSetting, fontSizeMode })
  }

  async function handleExport() {
    const purchases = await getAllPurchases()
    const schemeData = await db.settings.get('scheme')
    const appData = await db.settings.get('app')
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      purchases,
      settings: { scheme: schemeData?.value, app: appData?.value },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jod-lakhrueng-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (!data.purchases || !Array.isArray(data.purchases)) {
        alert('ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์สำรองข้อมูลที่ถูกต้อง')
        return
      }
      await db.purchases.bulkPut(data.purchases as PurchaseEntry[])
      if (data.settings?.scheme) await db.settings.put({ key: 'scheme', value: data.settings.scheme })
      if (data.settings?.app) await db.settings.put({ key: 'app', value: data.settings.app })
      alert(`นำข้อมูลกลับมาแล้ว ${data.purchases.length} รายการ`)
    } catch {
      alert('เกิดข้อผิดพลาด ไม่สามารถนำข้อมูลกลับมาได้')
    }
    e.target.value = ''
  }

  async function handleClearAll() {
    await clearAllPurchases()
    setShowClearConfirm2(false)
  }

  const inputClass = 'w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none'
  const labelClass = 'text-base text-gray-500 block mb-1'
  const sectionClass = 'bg-white rounded-2xl p-5 border border-gray-200 space-y-4'

  return (
    <div className="max-w-md mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-sm text-gray-400 mt-1">ถ้ารัฐเปลี่ยนกติกา คุณสามารถแก้ตัวเลขตรงนี้ได้เอง</p>
      </header>

      <div className="px-4 space-y-5 pb-8">
        {/* Scheme settings */}
        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">กติกาโครงการ</h2>

          <div>
            <label htmlFor="subsidyRate" className={labelClass}>รัฐช่วยกี่เปอร์เซ็นต์</label>
            <div className="relative">
              <input id="subsidyRate" type="number" value={subsidyRate} onChange={(e) => setSubsidyRate(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="dailyCap" className={labelClass}>รัฐช่วยสูงสุดต่อวัน</label>
            <div className="relative">
              <input id="dailyCap" type="number" value={dailyCap} onChange={(e) => setDailyCap(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">บาท</span>
            </div>
          </div>

          <div>
            <label htmlFor="monthlyCap" className={labelClass}>รัฐช่วยสูงสุดต่อเดือน</label>
            <div className="relative">
              <input id="monthlyCap" type="number" value={monthlyCap} onChange={(e) => setMonthlyCap(e.target.value)} className={inputClass} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">บาท</span>
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className={labelClass}>วันเริ่มโครงการ (ไม่บังคับ)</label>
            <input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="endDate" className={labelClass}>วันสิ้นสุดโครงการ (ไม่บังคับ)</label>
            <input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleResetScheme} className="flex-1 border-2 border-gray-300 text-gray-600 text-base font-medium py-3 rounded-2xl min-h-[48px]">
              คืนค่าเริ่มต้น
            </button>
            <button onClick={handleSaveScheme} className="flex-1 bg-blue-600 text-white text-base font-semibold py-3 rounded-2xl min-h-[48px]">
              {saved ? '✓ บันทึกแล้ว' : 'บันทึก'}
            </button>
          </div>
        </div>

        {/* Font size */}
        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">ขนาดตัวอักษร</h2>
          <div className="flex gap-2">
            {(['normal', 'large', 'extra-large'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFontSizeMode(mode)}
                className={`flex-1 py-3 rounded-2xl border-2 text-base font-medium min-h-[48px] ${fontSizeMode === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}
              >
                {mode === 'normal' ? 'ปกติ' : mode === 'large' ? 'ใหญ่' : 'ใหญ่มาก'}
              </button>
            ))}
          </div>
          <button onClick={handleSaveFontSize} className="w-full bg-blue-600 text-white text-base font-semibold py-3 rounded-2xl min-h-[48px]">
            บันทึกขนาดตัวอักษร
          </button>
        </div>

        {/* Backup */}
        <div className={sectionClass}>
          <h2 className="text-xl font-semibold text-gray-700">ข้อมูล</h2>
          <p className="text-base text-gray-500">ข้อมูลทั้งหมดเก็บอยู่ในเครื่องนี้เท่านั้น แนะนำสำรองข้อมูลเป็นประจำ</p>

          <button onClick={handleExport} className="w-full border-2 border-blue-200 text-blue-700 text-base font-medium py-3 rounded-2xl min-h-[48px]">
            📥 สำรองข้อมูล (Export)
          </button>

          <button onClick={() => importRef.current?.click()} className="w-full border-2 border-gray-200 text-gray-700 text-base font-medium py-3 rounded-2xl min-h-[48px]">
            📤 นำข้อมูลกลับมา (Import)
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" aria-label="นำเข้าไฟล์สำรองข้อมูล" />

          <button onClick={() => setShowClearConfirm(true)} className="w-full border-2 border-red-200 text-red-600 text-base font-medium py-3 rounded-2xl min-h-[48px]">
            🗑️ ล้างข้อมูลทั้งหมด
          </button>
        </div>

        {/* Privacy link */}
        <button onClick={() => navigate('/privacy')} className="w-full text-center text-blue-600 text-base py-3">
          นโยบายความเป็นส่วนตัว →
        </button>
      </div>

      {showClearConfirm && (
        <ConfirmDialog
          message="ล้างข้อมูลทั้งหมด?"
          subMessage="รายการซื้อทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้"
          confirmLabel="ล้างข้อมูล"
          cancelLabel="ยกเลิก"
          onConfirm={() => { setShowClearConfirm(false); setShowClearConfirm2(true) }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
      {showClearConfirm2 && (
        <ConfirmDialog
          message="ยืนยันอีกครั้ง?"
          subMessage="ข้อมูลทั้งหมดจะหายไปถาวร"
          confirmLabel="ยืนยัน ลบเลย"
          cancelLabel="ยกเลิก"
          onConfirm={handleClearAll}
          onCancel={() => setShowClearConfirm2(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: implement settings page with scheme config, font size, backup/import"
```

---

## Task 12: Privacy Page & Campaign Lock

**Files:**
- Modify: `src/pages/PrivacyPage.tsx`

- [ ] **Step 1: Replace `src/pages/PrivacyPage.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'

export default function PrivacyPage() {
  const navigate = useNavigate()
  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="text-2xl p-2 -ml-2 text-gray-600" aria-label="ย้อนกลับ">←</button>
        <h1 className="text-2xl font-bold text-gray-800">นโยบายความเป็นส่วนตัว</h1>
      </header>

      <div className="px-4 pb-8 space-y-5 text-lg text-gray-700 leading-relaxed">
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <p className="font-semibold text-blue-800 text-xl mb-2">ข้อมูลของคุณอยู่ในเครื่องนี้เท่านั้น</p>
          <p>เราไม่เห็น ไม่เก็บ และไม่ส่งข้อมูลรายการซื้อของคุณไปที่ server ใดๆ ทั้งสิ้น</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">เราไม่มี</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✕ ระบบ login หรือสมัครสมาชิก</li>
            <li>✕ การเก็บข้อมูลบน server</li>
            <li>✕ การติดตามพฤติกรรมผู้ใช้</li>
            <li>✕ โฆษณา หรือ third-party tracker</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">ข้อมูลเก็บที่ไหน?</h2>
          <p className="text-gray-600">รายการซื้อและการตั้งค่าทั้งหมดเก็บไว้ใน browser ของเครื่องนี้เท่านั้น ถ้าล้าง browser หรือเปลี่ยนเครื่อง ข้อมูลอาจหาย แนะนำสำรองข้อมูลเป็นประจำที่หน้าตั้งค่า</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">เว็บนี้ไม่ใช่เว็บทางการ</h2>
          <p className="text-gray-600">จดละครึ่ง พลัส เป็นเครื่องมือช่วยจดส่วนตัว พัฒนาขึ้นเพื่อความสนุกและเพื่อแก้ปัญหาที่พบในชีวิตจริง ไม่ใช่เว็บไซต์ทางการของหน่วยงานรัฐหรือของโครงการคนละครึ่ง พลัส</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/PrivacyPage.tsx
git commit -m "feat: implement privacy page"
```

---

## Task 13: PWA Setup

**Files:**
- Create: `public/logo.svg`
- Modify: `vite.config.ts` (add VitePWA plugin)
- Create: `public/CNAME`

- [ ] **Step 1: Create `public/logo.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" fill="#2563EB"/>
  <text x="256" y="300" text-anchor="middle" font-family="sans-serif" font-size="220" font-weight="700" fill="white">จด</text>
</svg>
```

- [ ] **Step 2: Generate PNG icons from SVG**

```bash
npm install -D @vite-pwa/assets-generator
npx pwa-assets-generator --preset minimal public/logo.svg
```

Expected: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon-180x180.png`, `public/favicon.ico` created.

- [ ] **Step 3: Replace `vite.config.ts` with PWA-enabled version**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'logo.svg'],
      manifest: {
        name: 'จดละครึ่ง พลัส',
        short_name: 'จดละครึ่ง',
        description: 'ติดตามสิทธิโครงการคนละครึ่ง พลัส',
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
```

- [ ] **Step 4: Create `public/CNAME`**

```
jod6040.withyamroll.com
```

- [ ] **Step 5: Verify build succeeds**

```bash
npm run build
```

Expected: `dist/` folder created with `index.html`, `404.html` not yet present (added in next task), `sw.js`, `manifest.webmanifest`, icons.

- [ ] **Step 6: Commit**

```bash
git add public/ vite.config.ts
git commit -m "feat: add PWA manifest, service worker, and icons"
```

---

## Task 14: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Copy index.html as 404.html for SPA routing
        run: cp dist/index.html dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Update `package.json` to ensure build script exists**

Verify `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

- [ ] **Step 3: Run full test suite one final time**

```bash
npx vitest run
```

Expected: All tests pass with no failures.

- [ ] **Step 4: Final build verification**

```bash
npm run build
ls dist/
```

Expected output includes: `index.html`, `sw.js`, `manifest.webmanifest`, `pwa-192x192.png`, `pwa-512x512.png`, `CNAME`, `assets/`

- [ ] **Step 5: Final commit**

```bash
git add .github/ package.json
git commit -m "feat: add GitHub Actions deployment workflow for GitHub Pages"
```

- [ ] **Step 6: Create GitHub repo and push**

```bash
gh repo create jod-lakhrueng-plus --public --source=. --remote=origin --push
```

If `gh` CLI is not authenticated, run `gh auth login` first.

Expected: Repo created at `github.com/LordEaster/jod-lakhrueng-plus`, GitHub Actions workflow triggers automatically.

- [ ] **Step 7: Enable GitHub Pages in repo settings**

Go to: `https://github.com/LordEaster/jod-lakhrueng-plus/settings/pages`

Set:
- Source: **GitHub Actions**

Wait for the workflow to complete (~2 minutes). Site will be live at `https://lordeaster.github.io/jod-lakhrueng-plus`.

- [ ] **Step 8: Configure custom domain**

In your DNS provider, add a CNAME record:
```
jod6040.withyamroll.com  →  lordeaster.github.io
```

Then in GitHub Pages settings, add custom domain: `jod6040.withyamroll.com` and enable **Enforce HTTPS**.

---

## Self-Review Checklist

- [x] **Spec §3 DB Schema** → Task 2 (types) + Task 5 (Dexie)
- [x] **Spec §4 Calculation logic** → Task 3 with 9 tests covering all examples from spec
- [x] **Spec §5 Campaign time window** → Task 7 `useCampaignStatus` + `CampaignLockScreen`
- [x] **Spec §6.1 Home page** → Task 8
- [x] **Spec §6.2 Add page** → Task 9
- [x] **Spec §6.3 History page** → Task 10
- [x] **Spec §6.4 Settings page** → Task 11
- [x] **Spec §6.5 Privacy page** → Task 12
- [x] **Spec §7 UX rules** → min-h-[56px] buttons throughout, Thai text only, color+text labels
- [x] **Spec §8 PWA** → Task 13
- [x] **Spec §9 Deployment** → Task 14
- [x] **Spec monthly reset** → automatic via `month` field query (no code needed)
- [x] **Spec พ.ศ. display** → Task 4 `formatThaiDate`/`formatThaiMonth` +543
- [x] **Spec on-the-fly calculation** → `subsidyAmount` never stored; computed in hooks
- [x] **Spec 3 recent entries (no FavoriteItem table)** → `db.purchases.orderBy('createdAt').reverse().limit(3)`
- [x] **Spec fixed shortcuts [50,60,80,100,120,150,200,333]** → Task 9 `AmountShortcutGrid`
- [x] **Spec amount > 50,000 confirmation** → Task 9 `AddPurchasePage`
- [x] **Spec delete confirmation** → Task 10 `HistoryPage` + `ConfirmDialog`
- [x] **Spec double confirmation for clear all** → Task 11 two sequential `ConfirmDialog`
- [x] **Spec export/import backup** → Task 11 `SettingsPage`
