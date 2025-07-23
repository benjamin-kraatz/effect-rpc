import { Effect } from "effect";

export type Simplification<T extends Effect.Effect<any, any, never>> =
  T extends Effect.Effect<infer R, infer E, never>
    ? Effect.Effect<R, E, never>
    : never;

function main() {
  const effect: Effect.Effect<string, Error, never> =
    Effect.succeed("Hello, world!");
  const simplified: Simplification<typeof effect> = effect;
  console.log(simplified);
}

main();
