# Contributing

Contributions are welcome! This page covers everything you need to get the project running locally and submit changes.

## Setup

Clone the repo and install root dependencies:

::: code-group

```sh [bun]
git clone https://github.com/juleshry/vue-animejs.git
cd vue-animejs
bun install
```

```sh [npm]
git clone https://github.com/juleshry/vue-animejs.git
cd vue-animejs
npm install
```

```sh [pnpm]
git clone https://github.com/juleshry/vue-animejs.git
cd vue-animejs
pnpm install
```

```sh [yarn]
git clone https://github.com/juleshry/vue-animejs.git
cd vue-animejs
yarn install
```

:::

## Playground

The playground is a standalone Vite app for manual testing. It has its own `package.json` and must be installed separately:

::: code-group

```sh [bun]
cd playground
bun install && bun run playground:dev
```

```sh [npm]
cd playground
npm install && npm run playground:dev
```

```sh [pnpm]
cd playground
pnpm install && pnpm run playground:dev
```

```sh [yarn]
cd playground
yarn install && yarn playground:dev
```

:::

## Docs

The documentation site (this site) is also a separate sub-project:

::: code-group

```sh [bun]
cd docs
bun install && bun run docs:dev
```

```sh [npm]
cd docs
npm install && npm run docs:dev
```

```sh [pnpm]
cd docs
pnpm install && pnpm run docs:dev
```

```sh [yarn]
cd docs
yarn install && yarn docs:dev
```

:::

## Tests

Unit tests live in `tests/` and run with [Vitest](https://vitest.dev/):

```sh
bun run test
```

Watch mode:

```sh
bun run test:watch
```

Coverage report:

```sh
bun run test:coverage
```

## Adding a Composable

1. Create `src/composables/use-my-feature.ts`
2. Write the composable with full TypeScript types and JSDoc
3. Register cleanup in `onUnmounted`
4. Export it from `src/index.ts`
5. Test it manually in the playground
6. Add a doc page under `docs/src/composables/use-my-feature.md`

See the [Documentation Rules](/guide/getting-started) for the expected page structure.

## Code Style

Formatting is handled by [oxfmt](https://github.com/oxc-project/oxc) and linting by [oxlint](https://oxc.rs/docs/guide/usage/linter.html). Run both before committing:

```sh
bun run format
bun run lint
```

Format check only (used in CI):

```sh
bun run format:check
```

Key conventions:
- 2-space indentation, double quotes, no semicolons
- Local variables use `snake_case`; functions and parameters use `camelCase`
- Composable files: exports first, helpers below
