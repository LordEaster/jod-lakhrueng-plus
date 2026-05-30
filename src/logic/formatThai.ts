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
