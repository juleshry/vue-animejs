import { configDefaults, defineConfig, lazyPlugins } from "vite-plus"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    printWidth: 120,
    tabWidth: 2,
    semi: false,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "avoid",
    endOfLine: "lf",
    vueIndentScriptAndStyle: true,
    insertFinalNewline: false,
  },
  lint: {
    plugins: ["typescript"],
    categories: {
      correctness: "warn",
    },
    rules: {
      "typescript/no-explicit-any": "error",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
  },
  plugins: lazyPlugins(() => []),
  resolve: {
    alias: {
      "@lib": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      "@src": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      formats: ["es", "cjs"],
      fileName: "index",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue", "animejs", "@vueuse/core"],
    },
  },
  test: {
    environment: "happy-dom",
    globals: false,
    pool: "vmThreads",
    // Playwright e2e specs, run with `bun run test:e2e`
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
})