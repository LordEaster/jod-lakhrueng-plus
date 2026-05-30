export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function sanitizeMoneyInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '')
  const [integerPart, ...decimalParts] = cleaned.split('.')
  if (decimalParts.length === 0) return integerPart
  return `${integerPart}.${decimalParts.join('').slice(0, 2)}`
}

export function parseMoneyInput(value: string): number | undefined {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : undefined
}
