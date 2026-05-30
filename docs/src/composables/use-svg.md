# useSvg

Exposes Anime.js SVG utilities as a Vue composable, automatically unwrapping reactive refs passed to each helper.

For drawable stroke animations, use [`useSvgDrawable`](/composables/use-svg-drawable) instead.

## Helpers

| Helper | Description |
|---|---|
| [`morphTo`](/composables/use-svg-morph-to) | Morph an SVG `<path>` to another shape |
| [`createMotionPath`](/composables/use-svg-motion-path) | Animate an element along an SVG `<path>` track |

## Type Declarations

::: details Show Type Declarations

```ts
export interface UseSvgReturn {
  /** Returns a `FunctionValue` that morphs the current path to the given `path`. Pass the result as the `d` property in `useAnimate` options. */
  morphTo: (path: MaybeRef<TargetsParam>, precision?: MaybeRef<number>) => FunctionValue
  /** Creates a motion-path object from an SVG `<path>`. Spread the result into `useAnimate` options to animate `translateX`, `translateY`, and `rotate` along the path. */
  createMotionPath: (path: MaybeRef<TargetsParam>, offset?: MaybeRef<number>) => ReturnType<typeof svg.createMotionPath>
}

/**
 * Exposes Anime.js SVG utilities (`svg.morphTo`, `svg.createMotionPath`) as a Vue composable, automatically unwrapping reactive refs passed to each helper.
 *
 * For drawable stroke animations, use `useSvgDrawable` instead.
 */
export declare function useSvg(): UseSvgReturn
```

:::

## Source

[`Github`](https://github.com/juleshry/vue-animejs/blob/main/src/composables/use-svg.ts)
