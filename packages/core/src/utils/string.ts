function isDefined(value: unknown): value is string {
  return typeof value === 'string'
}

export const StringUtils = {
  isDefined,
}
