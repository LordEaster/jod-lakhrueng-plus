# จดละครึ่ง พลัส — Design Spec

**Date:** 2026-05-30
**Domain:** jod6040.withyamroll.com
**Repo:** LordEaster/jod-lakhrueng-plus

---

## 1. Product Overview

Thai-language local-first PWA for tracking 60/40 government subsidy spending.
Users record purchases; the app calculates how much the government subsidises vs. what the user pays, against daily and monthly caps.

**Core principle:** "ผู้ใช้ไม่ได้อยากทำบัญชี ผู้ใช้แค่อยากรู้ว่าวันนี้ใช้สิทธิครบหรือยัง"

**Target users:** Elderly Thai users, general public, family members who set up the app for elderly relatives.

**Context:** จดละครึ่ง พลัส เป็นเครื่องมือช่วยจดส่วนตัว สำหรับผู้ใช้สิทธิ **โครงการคนละครึ่ง พลัส** โดยเฉพาะ พัฒนาขึ้นเพื่อความสนุกและเพื่อแก้ปัญหาที่พบในชีวิตจริง ไม่ใช่เว็บไซต์ทางการของหน่วยงานรัฐหรือของโครงการแต่อย่างใด

**Privacy stance:** แอปนี้ไม่มีการเก็บ ส่ง หรือแบ่งปันข้อมูลผู้ใช้ใดๆ ทั้งสิ้น ทุกรายการซื้อและการตั้งค่าถูกเก็บไว้ในเครื่องของผู้ใช้เท่านั้น ไม่มี backend ไม่มี analytics ไม่มี tracking ไม่มีระบบ login สิ่งที่เกิดขึ้นในแอปอยู่ในเครื่องคุณเท่านั้น

---

## 2. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 18 + TypeScript | Type safety for calculation logic |
| Build | Vite | Fast dev, small bundles |
| Styling | Tailwind CSS | Rapid responsive UI |
| Routing | React Router v6 | Lazy loading for non-critical pages |
| Storage | Dexie.js (IndexedDB) | Structured local storage, no backend |
| PWA | vite-plugin-pwa + Workbox | Cache-first, installable |
| Font | Sarabun (Google Fonts) | Standard Thai web font, readable |
| Deploy | GitHub Pages via GitHub Actions | Free, static-friendly |

---

## 3. DB Schema

All data stays on-device. No backend. No login.

### purchases table
```ts
type PurchaseEntry = {
  id: string           // nanoid
  date: string         // "2026-05-30" CE — used for daily queries
  month: string        // "2026-05" CE — used for monthly queries
  amount: number       // raw purchase amount only (subsidy computed on-the-fly)
  title?: string
  category?: 'food' | 'drink' | 'household' | 'medicine' | 'other'
  note?: string
  createdAt: string    // ISO timestamp — used to order entries for cap calculation
  updatedAt: string
}
```

### settings table (key-value)
```ts
// key: 'scheme'
type SchemeSetting = {
  subsidyRate: number   // default 0.6
  dailyCap: number      // default 200
  monthlyCap: number    // default 1000
  startDate?: string    // campaign start date YYYY-MM-DD
  endDate?: string      // campaign end date YYYY-MM-DD
  currency: 'THB'
  updatedAt: string
}

// key: 'app'
type AppSetting = {
  fontSizeMode: 'normal' | 'large' | 'extra-large'
  reduceMotion: boolean
  showInstallHint: boolean
  updatedAt: string
}
```

**Key decision:** `subsidyAmount` and `userPaidAmount` are NOT stored. They are always computed on-the-fly from raw `amount` values. This avoids cascade update complexity when entries are edited.

---

## 4. Calculation Logic

### Core algorithm
```ts
// Entries for a given day, sorted by createdAt ASC
function calculateDailySubsidy(
  entries: PurchaseEntry[],
  setting: SchemeSetting,
  monthUsedBefore: number  // subsidy already used earlier in the same month
): EnrichedEntry[]

// Per entry:
// proportional = amount × subsidyRate
// actual = min(proportional, remainingDaily, remainingMonthly)
// userPaid = amount - actual
// Update runningDaily += actual, runningMonthly += actual
```

### Summary functions
```ts
function getDailySummary(date: string, setting: SchemeSetting): DailySummary
// returns: { totalAmount, totalSubsidy, totalUserPaid, remainingDaily, remainingMonthly, toFillDaily }

function getMonthlySummary(month: string, setting: SchemeSetting): MonthlySummary
// returns: { totalAmount, totalSubsidy, totalUserPaid, remainingMonthly }
```

### toFillDaily (ปุ่ม "เต็มสิทธิวันนี้")
```ts
toFillDaily = ceil(min(remainingDaily, remainingMonthly) / subsidyRate)
// e.g. remainingDaily=80, rate=0.6 → ceil(80/0.6) = 134 บาท
```

### Monthly reset
Automatic — monthly summary queries entries where `month = "YYYY-MM"`. New month = new query, balance starts at 0. History is never deleted.

---

## 5. Campaign Time Window

The app respects `startDate` and `endDate` from SchemeSetting.

| Condition | Behaviour |
|-----------|-----------|
| `today < startDate` | Lock screen: "โครงการยังไม่เริ่ม" + start date |
| `startDate ≤ today ≤ endDate` | Normal app |
| `today > endDate` | Lock screen: "โครงการสิ้นสุดแล้ว" + [ดูประวัติ] button |
| `startDate` or `endDate` not set | Normal app (no restriction) |

History page remains accessible from the lock screen after campaign ends.

---

## 6. Navigation & Pages

### Navigation structure
- **Bottom nav** (always visible): หน้าแรก | ประวัติ | ตั้งค่า
- **FAB** "+ จดรายการซื้อ": fixed above bottom nav on Home page
- History, Settings, Privacy: **lazy loaded**

### Pages

#### `/` — Home
1. Header: "จดละครึ่ง พลัส"
2. TodaySummaryCard — status colour + label + numbers
3. FAB: "+ จดรายการซื้อ"
4. MonthSummaryCard
5. รายการล่าสุด 3 รายการ
6. ปุ่ม "ดูประวัติทั้งหมด"

**TodaySummaryCard status colours (always with text label):**
- ≥50% remaining → green "ยังใช้ได้อีก"
- 1–49% remaining → yellow "ใกล้เต็มวันนี้แล้ว"
- 0% remaining → blue "วันนี้เต็มสิทธิแล้ว"

**Empty state:** "วันนี้ยังไม่มีรายการซื้อ / กดปุ่มด้านล่างเพื่อจดรายการแรกของวันนี้"

#### `/add` — Add Purchase
1. ช่องยอดเงิน (numeric, autofocus)
2. ปุ่มยอดลัด (fixed): 50 / 60 / 80 / 100 / 120 / 150 / 200 / 333 / เต็มสิทธิวันนี้
3. Quick-repeat: 3 most recent entries as pre-fill buttons (no separate FavoriteItem table)
4. ชื่อรายการ (optional)
5. หมวดหมู่ (optional)
6. [ยกเลิก] [บันทึก]

**Post-save feedback:** "บันทึกแล้ว / รัฐช่วย X บาท / คุณจ่ายเอง Y บาท" → auto-return to Home

**Validation:**
- Amount = 0 → "กรุณาใส่ยอดซื้อ"
- Amount > 50,000 → confirmation dialog (per brief)

#### `/history` — History (lazy)
- Month filter (default: current month)
- Monthly summary for selected month
- Entries grouped by day, each with computed subsidy breakdown
- Edit / Delete per entry (delete requires confirmation)

#### `/settings` — Settings (lazy)
- กติกาโครงการ: subsidyRate, dailyCap, monthlyCap, startDate, endDate
- ขนาดตัวอักษร: normal / large / extra-large
- สำรองข้อมูล (export JSON)
- นำข้อมูลกลับมา (import JSON)
- ล้างข้อมูลทั้งหมด (with double confirmation)
- ลิงก์ไปหน้า Privacy

#### `/privacy` — Privacy (lazy)
Static text: ข้อมูลในเครื่องเท่านั้น, ไม่ใช่เว็บทางการ, แนะนำสำรองข้อมูล

---

## 7. UX Rules

- ปุ่มหลักสูง ≥ 56px
- ตัวเลขสำคัญ 40–56px
- ข้อความทั่วไป 18–20px
- ภาษาไทยเสมอ — ไม่มีคำ subsidy/quota/cap/sync
- ปีแสดงเป็น พ.ศ. เสมอ (+543 จาก CE)
- Time window ไม่ใช้ในการคำนวณ — ใช้ date (YYYY-MM-DD) เท่านั้น
- ทุกสีต้องมีข้อความกำกับ (accessibility)
- prefers-reduced-motion respected
- semantic HTML + ARIA labels

---

## 8. PWA

```
manifest.json
  name: "จดละครึ่ง พลัส"
  short_name: "จดละครึ่ง"
  display: "standalone"
  icons: 192×192, 512×512

Service Worker (Workbox)
  Cache-first: JS, CSS, fonts, icons
  App shell cached on first visit
  Offline: app opens from cache after first visit
```

Install hint shown on first visit (dismissible): "เพิ่มเว็บนี้ไว้หน้าจอมือถือ เพื่อจดรายการได้เร็วขึ้น"

---

## 9. Deployment

```
GitHub: LordEaster/jod-lakhrueng-plus
Branch: main → build → gh-pages
Custom domain: jod6040.withyamroll.com
CNAME file in public/

GitHub Actions workflow:
  trigger: push to main
  steps: npm ci → npm run build → deploy dist/ to gh-pages
```

---

## 10. Implementation Strategy

**Approach C — Walking skeleton first:**

1. Core logic (calculateSubsidy, summaries) + unit tests
2. DB setup (Dexie) + repositories
3. Home page + Add page (full working flow)
4. History page
5. Settings page (scheme config + backup/import)
6. Privacy page + Campaign lock screen
7. PWA (manifest + service worker)
8. GitHub Actions + deploy

---

## 11. Out of Scope (MVP)

OCR, voice input, cloud sync, login, charts, social sharing, gamification, analytics, multi-profile, passcode lock.
