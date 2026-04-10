# Contributing

Contributions are welcome!

## Setup

```bash
git clone https://github.com/juleshry/vue-animejs.git
cd vue-animejs

# using bun
bun install
# using npm
npm install
# using pnpm
pnpm install
# using yarn
yarn install
```

## Playground

For manual testing and development:

```bash
cd playground

# using bun
bun install && bun run playground:dev
# using npm
npm install && npm run playground:dev
# using pnpm
pnpm install && pnpm run playground:dev
# using yarn
yarn install && yarn playground:dev
```

## Docs

VitePress documentation site:

```bash
cd docs

# using bun
bun install && bun run docs:dev
# using npm
npm install && npm run docs:dev
# using pnpm
pnpm install && pnpm run docs:dev
# using yarn
yarn install && yarn docs:dev
```

## Adding a composable

1. Create `src/composables/use-my-feature.ts`
2. Write the composable with full TypeScript types
3. Register cleanup logic with `onUnmounted`
4. Export it from `src/index.ts`
5. Test it manually via the playground (`playground/App.vue`)

## Code style

Prettier handles formatting. Run before committing:

```bash
# using bun
bun run prettier --write .
# using npm
npm run prettier --write .
# using pnpm
pnpm run prettier --write .
# using yarn
yarn prettier --write .
```