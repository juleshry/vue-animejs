import { describe, it, expect } from "vite-plus/test"
import { kebabCase } from "@src/utils/kebab-case.ts"

describe("kebabCase", () => {
  it.each<[string, string]>([
    ["zIndex", "z-index"],
    ["backgroundColor", "background-color"],
    ["borderTopLeftRadius", "border-top-left-radius"],
    ["pathLength", "path-length"],
  ])("converts %s to %s", (key, expected) => {
    expect(kebabCase(key)).toBe(expected)
  })

  it.each<string>(["opacity", "z-index", "stroke-dasharray", ""])("leaves %o unchanged", key => {
    expect(kebabCase(key)).toBe(key)
  })

  it("prefixes a leading capital with a dash, giving the vendor-prefixed CSS name", () => {
    expect(kebabCase("WebkitTransform")).toBe("-webkit-transform")
  })

  it("splits every capital in a run", () => {
    expect(kebabCase("fooBAR")).toBe("foo-b-a-r")
  })

  // Callers must skip CSS variables: their names are case-sensitive
  it("does not special-case CSS variables", () => {
    expect(kebabCase("--myVar")).toBe("--my-var")
  })
})