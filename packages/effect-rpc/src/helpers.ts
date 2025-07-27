import { RpcClient, RpcGroup, RpcSerialization } from '@effect/rpc';
import { Effect, Layer } from 'effect';

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
 * Gets an RPC client for a specific request within a given RPC group.
 *
 * Reusable function for the client and the server.
 *
 * @param rpcGroup - The RPC group to get the client from.
 * @param requestName - The name of the request to get the client for.
 * @returns A function that takes the request payload and returns the response.
 */
export function getRPCClient<
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
