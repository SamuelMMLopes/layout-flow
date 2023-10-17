function isGreaterThanZero(value: number): boolean {
  return value > 0
}

function isGreaterThanZeroMultiple(...values: number[]): boolean {
  return values.every((value) => value > 0)
}

export const NumberUtils = {
  isGreaterThanZero,
  isGreaterThanZeroMultiple,
}
