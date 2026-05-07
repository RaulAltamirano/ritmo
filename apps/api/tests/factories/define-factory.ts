export function defineFactory<T, U = T>(opts: {
  build: (overrides?: Partial<T>) => T
  create: (overrides?: Partial<T>) => Promise<U>
}): { build: typeof opts.build; create: typeof opts.create } {
  return {
    build: opts.build,
    create: opts.create,
  }
}
