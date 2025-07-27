import { Rpc, RpcClient, RpcGroup, RpcSerialization } from '@effect/rpc';
import { Effect, Layer } from 'effect';
import type { TaggedHandler } from './registry';

/**
 * Type representing a serialization layer for RPC communication.
 * It is just a wrapper around a `Layer` that provides the `RpcSerialization.RpcSerialization` type.
 *
 * @since 0.6.0
 */
export type SerializationLayer = Layer.Layer<RpcSerialization.RpcSerialization, never, never>;

/**
 * Infers the client type for a given RPC group.
 *
 * @template T - The type to infer the client from, expected to be an instance of `RpcGroup.RpcGroup`.
 */
export type InferClient<T> = T extends RpcGroup.RpcGroup<infer R> ? RpcClient.RpcClient<R> : never;

/**
 * Makes a request for a specific request within a given RPC group.
 * It builds up the request and executes it, returning the response.
 *
 * Reusable function for the client and the server.
 *
 * @param rpcGroup - The RPC group to get the client from.
 * @param requestName - The name of the request to get the client for.
 * @returns A function that takes the request payload and returns the response.
 */
export function makeRPCRequest<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends RpcGroup.RpcGroup<any>,
  K extends keyof InferClient<T>,
>(
  rpcGroup: T,
  requestName: K,
): (payload: Parameters<InferClient<T>[K]>[0]) => ReturnType<InferClient<T>[K]> {
  return (payload: Parameters<InferClient<T>[K]>[0]) => {
    const program = Effect.gen(function* () {
      const client = yield* RpcClient.make(rpcGroup);
      const req = client[requestName];
      const res = yield* req(payload);
      yield* Effect.log(`Response from ${String(requestName)}:`, res);
      return res;
    }).pipe(Effect.scoped) as ReturnType<InferClient<T>[K]>;

    return program;
  };
}

// export function makeRPCRequestWithTaggedHandler<THandler extends Effect.Effect<any, any, any>>(
//   taggedHandler: Effect.Effect<THandler, any, any>,
//   // payload: Parameters<THandler>[0],
// ) {
//   return Effect.gen(function* () {
//     return yield* taggedHandler;
//   }).pipe(Effect.scoped);
// }

export function makeRPCRequestWithTaggedHandler<
  V extends RpcGroup.RpcGroup<any>,
  N extends keyof InferClient<V>,
  THandler extends (...args: Parameters<InferClient<V>[N]>[0]) => ReturnType<InferClient<V>[N]>,
>(taggedHandler: THandler): Effect.Effect<ReturnType<InferClient<V>[N]>, any, any> {
  const res = taggedHandler({ name: 'Sebse' });
  console.log('RES RES', taggedHandler);
  return Effect.gen(function* () {
    yield* Effect.log(`Making RPC request with payload!`);
    const res = yield* taggedHandler({ name: 'Sebse' });
    yield* Effect.log(`Response received:`, res);
    return res;
  }).pipe();
}
