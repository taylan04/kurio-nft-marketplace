import Decimal from 'decimal.js'

export function addEth(...values: string[]) {
  return values.reduce((total, value) => total.plus(value || '0'), new Decimal(0)).toFixed(3)
}

export function multiplyEth(value: string, quantity: number) {
  return new Decimal(value).times(quantity).toFixed(3)
}

export function subtractEth(a: string, b: string) {
  return Decimal.max(new Decimal(a).minus(b), 0).toFixed(3)
}

export function formatEth(value: string, minDecimals = 2) {
  const decimal = new Decimal(value || '0')
  const fixed = decimal.toFixed(Math.max(minDecimals, Math.min(3, decimal.decimalPlaces())))
  return `${fixed} ETH`
}
