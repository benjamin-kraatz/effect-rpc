import { RpcGroup } from "@effect/rpc";
import { getRPCClient, type InferClient } from "./helpers";

/**
 * Creates a function to perform an RPC request using the provided RPC group and request name.
 *
 * This hook returns a function that, when called with the appropriate payload, constructs
 * an Effect program that:
 *  - Instantiates an RPC client for the given group.
 *  - Invokes the specified request with the provided payload.
 *  - Logs the response.
 *  - Returns the response as the result of the Effect.
 *
 * @template T - The type of the RPC group, extending `RpcGroup.RpcGroup<any>`.
 * @template K - The key of the request within the inferred client from the RPC group.
 *
 * @param rpcGroup - The RPC group definition containing available RPC methods.
 * @param requestName - The name of the request method to invoke within the RPC group.
 * @returns A function that takes the request payload and returns an Effect program
 *          representing the RPC call and its response.
 *
 * @example
 * ```typescript
 * const getUser = useRPCRequest(userRpcGroup, "getUser");
 * const program = getUser({ id: "123" });
 * // program is an Effect that, when run, will perform the RPC call and return the user data.
 * ```
 */
export function useRPCRequest<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends RpcGroup.RpcGroup<any>,
  K extends keyof InferClient<T>
>(
  rpcGroup: T,
  requestName: K
): (
  payload: Parameters<InferClient<T>[K]>[0]
) => ReturnType<InferClient<T>[K]> {
  return getRPCClient(rpcGroup, requestName);
}
