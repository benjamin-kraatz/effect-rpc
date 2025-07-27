import { RpcGroup } from '@effect/rpc';
import type { Context } from '@effect/rpc/Rpc';
import { type InferClient, makeRPCRequest } from './helpers';
import { createRPCHandler, type RequestImplementations, type RPCHandlerConfig } from './server';

type RegistryKey = string;

/**
 * Type representing a tagged handler with methods to access requests and perform RPC calls.
 *
 * @since 0.8.0
 */
export type TaggedRPCGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>> = {
  tag: K;
  groups: V;
  /**
   * Returns all request names available in this handler.
   * This is useful for introspection or dynamic request handling.
   * @returns Array of requests available in this handler
   *
   * @example
   * ```typescript
   * const requests = handler.getRequests();
   * // requests is an array of all request objects available in this handler
   * ```
   *
   * @since 0.8.0
   *
   * @deprecated This will be removed in future versions.
   * Use `getRequest` to access specific requests directly.
   * There's no need to get all request names at once.
   */
  getRequests: () => Array<V extends { requests: ReadonlyMap<string, infer R> } ? R : never>;

  /**
   * Gets a specific request by name.
   *
   * It can be used to send it to the custom runtime to execute the request.
   *
   * @param name - The name of the request to retrieve.
   * @param payload - The payload to send with the request.
   * @returns The response from the request.
   *
   * @example
   * ```typescript
   * const request = handler.getRequest('SayHelloReq', { name: 'Alice' });
   * // request is an Effect that, when run, will perform the RPC call and return the response.
   * const result = await AppRuntime.runPromise(request); // result is the response from the RPC call
   * ```
   *
   * @since 0.8.0
   */
  getRequest: <N extends keyof InferClient<V>>(
    name: N,
    payload: Parameters<InferClient<V>[N]>[0],
  ) => ReturnType<InferClient<V>[N]>;

  createServerHandler: <R>(
    requestImplementations: RequestImplementations<V, InferClient<V>, R>,
    config: RPCHandlerConfig<R>,
  ) => (request: globalThis.Request, context?: Context<never> | undefined) => Promise<Response>;
};

/**
 * Creates a tagged group instance
 * @internal
 */
function createTaggedRPCGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
  tag: K,
  groups: V,
): TaggedRPCGroup<K, V> {
  const taggedGroup = {
    tag,
    groups: groups,
    getRequests: () => {
      const requests = groups.requests;
      return Array.from(requests.values()) as Array<
        V extends { requests: ReadonlyMap<string, infer R> } ? R : never
      >;
    },
    getRequest: <N extends keyof InferClient<V>>(
      name: N,
      payload: Parameters<InferClient<V>[N]>[0],
    ) => {
      const request = makeRPCRequest(groups, name);
      return request(payload);
    },
    createServerHandler(requestImplementations, config) {
      return (request: globalThis.Request, context?: Context<never> | undefined) => {
        return createRPCHandler(
          groups,
          requestImplementations,
          config,
        )(request, context) as Promise<Response>;
      };
    },
  } as TaggedRPCGroup<K, V>;

  return taggedGroup;
}

/**
 * Represents a registry for managing groups of RPC handlers, providing type-safe operations
 * for registering, retrieving, and querying handler groups by their unique tags.
 *
 * @template T - A record mapping registry keys to their corresponding {@link RpcGroup.RpcGroup} instances.
 *
 * @since 0.8.0
 */
export type RpcGroupRegistry<T extends Record<RegistryKey, RpcGroup.RpcGroup<any>>> = {
  /**
   * Registers a new RPC handler group under the specified tag.
   * The tag must not already exist in the registry.
   *
   * @typeParam K - The unique tag for the handler group.
   * @typeParam V - The handler group instance to register.
   * @param tag - The unique identifier for the handler group. Must not already exist in the registry.
   * @param rpcGroup - The handler group instance to register.
   * @returns A new {@link RpcGroupRegistry} instance including the newly registered group.
   */
  registerGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
    tag: K extends keyof T ? never : K,
    rpcGroup: V,
  ): RpcGroupRegistry<T & Record<K, V>>;

  /**
   * Registers a new RPC handler group and immediately returns the registered handler for the given tag.
   * The tag must not already exist in the registry.
   *
   * This is useful to re-use the `TaggedHandler` directly.
   *
   * @example
   * ```typescript
   * export const helloRouter = RpcGroup.make(
   *   Rpc.fromTaggedRequest(SayHelloReq),
   *   Rpc.fromTaggedRequest(SayByeReq),
   * );
   *
   * export const helloRequests = createRpcGroupRegistry().registerGetGroup('hello', helloRouter);
   * ```
   *
   * It registers the hello group and returns it.
   * Then you can do something like:
   *
   * ```typescript
   * // in /app/api/route.ts, for example
   * import { helloRequests } from './requests';
   *
   * const program = helloRequests.getRequest('SayHelloReq', { name });
   * ```
   *
   * This is shorter than just using `registerGroup` which would require to get the `hello` handlers first.
   *
   * @typeParam K - The unique tag for the handler group.
   * @typeParam V - The handler group instance to register.
   * @param tag - The unique identifier for the handler group. Must not already exist in the registry.
   * @param rpcGroup - The handler group instance to register.
   * @returns The {@link TaggedRPCGroup} for the newly registered group.
   */
  registerGetGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
    tag: K extends keyof T ? never : K,
    rpcGroup: V,
  ): TaggedRPCGroup<
    K extends keyof T ? never : K,
    (T & Record<K, V>)[K extends keyof T ? never : K]
  >;

  /**
   * Retrieves a registered handler group by its tag with full type safety.
   *
   * @typeParam K - The tag of the handler group to retrieve.
   * @param tag - The tag associated with the desired handler group.
   * @returns The {@link TaggedRPCGroup} corresponding to the specified tag.
   */
  get<K extends keyof T & string>(tag: K): TaggedRPCGroup<K, T[K]>;

  /**
   * Checks if a handler group exists for the specified tag.
   *
   * @typeParam K - The tag to check for existence.
   * @param tag - The tag to check in the registry.
   * @returns `true` if the handler group exists for the tag, otherwise `false`.
   */
  has<K extends string>(tag: K): tag is K & keyof T;

  /**
   * Retrieves all registered tags in the registry.
   *
   * @returns An array of all tags currently registered.
   */
  getTags(): (keyof T)[];
};

/**
 * Creates a type-safe handler registry that maintains exact type relationships.
 *
 * This is the recommended way to achieve full type safety. The registry uses a builder
 * pattern to accumulate groups and maintain their types without any global state.
 *
 * You can use it to manage all requests and handlers in a type-safe manner,
 * and access the requests directly without needing to know all request names or the router.
 *
 * @returns A registry object with methods to register and retrieve groups with full type safety
 *
 * @example
 * ```typescript
 * // Create a registry and register groups
 * const registry = createRpcGroupRegistry()
 *   .register('flamingo', helloRouter)
 *   .register('users', userRouter);
 *
 * // Get groups with full type safety
 * const flamingoGroup = registry.get('flamingo');
 * const validRequest = flamingoGroup.getRequest('SayHelloReq'); // ✓ Type-safe!
 * // const invalid = flamingoGroup.getRequest('IDontExist');    // ✗ Type error!
 * ```
 *
 * @since 0.8.0
 */
export function createRpcGroupRegistry<
  T extends Record<RegistryKey, RpcGroup.RpcGroup<any>> = {},
>() {
  function createRegistryWithRpcGroups<T extends Record<RegistryKey, RpcGroup.RpcGroup<any>>>(
    groups: T,
  ): RpcGroupRegistry<T> {
    const registry: RpcGroupRegistry<T> = {
      registerGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        rpcGroup: V,
      ): RpcGroupRegistry<T & Record<K, V>> {
        if (tag in groups) {
          throw new Error(`RPC group with tag "${tag}" already exists`);
        }

        const newGroups = { ...groups, [tag]: rpcGroup } as T & Record<K, V>;
        return createRegistryWithRpcGroups(newGroups);
      },
      registerGetGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        group: V,
      ): TaggedRPCGroup<
        K extends keyof T ? never : K,
        (T & Record<K, V>)[K extends keyof T ? never : K]
      > {
        const a = registry.registerGroup(tag, group);
        return a.get(tag);
      },

      get<K extends keyof T & string>(tag: K): TaggedRPCGroup<K, T[K]> {
        if (!(tag in groups)) {
          throw new Error(`RPC group with tag "${String(tag)}" not found`);
        }
        const group = groups[tag];
        if (!group) {
          throw new Error(`RPC group with tag "${String(tag)}" not found`);
        }
        return createTaggedRPCGroup(tag, group) as TaggedRPCGroup<K, T[K]>;
      },

      has<K extends string>(tag: K): tag is K & keyof T {
        return tag in groups;
      },

      getTags(): (keyof T)[] {
        return Object.keys(groups) as (keyof T)[];
      },
    };

    return registry;
  }

  return createRegistryWithRpcGroups({} as T);
}
