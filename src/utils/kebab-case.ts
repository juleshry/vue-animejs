/** Converts a camelCase CSS property or attribute name to kebab-case (`zIndex` → `z-index`). */
export function kebabCase(key: string): string {
  return key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`)
}