import { RpcClient, RpcGroup } from "@effect/rpc";

/**
 * Infers the client type for a given RPC group.
 *
 * @template T - The type to infer the client from, expected to be an instance of `RpcGroup.RpcGroup`.
 */
export type InferClient<T> = T extends RpcGroup.RpcGroup<infer R>
  ? RpcClient.RpcClient<R>
  : never;
