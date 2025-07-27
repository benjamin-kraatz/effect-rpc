import { RpcGroup } from '@effect/rpc';
import { type InferClient, makeRPCRequest } from './helpers';

type RegistryKey = string;

/**
 * Internal registry to store runtime handlers
 * @internal
 */
const __globalRegistry = new Map<string, any>();

/**
 * Type representing a tagged handler with methods to access requests and perform RPC calls.
 *
 * @since 0.8.0
 */
export type TaggedHandler<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>> = {
  tag: K;
  handlers: V;
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
};

/**
 * Creates a tagged handler instance
 * @internal
 */
function createTaggedHandler<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
  tag: K,
  handler: V,
): TaggedHandler<K, V> {
  const taggedHandler = {
    tag,
    handlers: handler,
    getRequests: () => {
      const requests = handler.requests;
      return Array.from(requests.values()) as Array<
        V extends { requests: ReadonlyMap<string, infer R> } ? R : never
      >;
    },
    getRequest: <N extends keyof InferClient<V>>(
      name: N,
      payload: Parameters<InferClient<V>[N]>[0],
    ) => {
      const request = makeRPCRequest(handler, name);
      return request(payload);
    },
  };

  return taggedHandler as TaggedHandler<K, V>;
}

/**
 * Creates a type-safe handler registry that maintains exact type relationships.
 *
 * This is the recommended way to achieve full type safety. The registry uses a builder
 * pattern to accumulate handlers and maintain their types without any global state.
 *
 * You can use it to manage all requests and handlers in a type-safe manner,
 * and access the requests directly without needing to know all request names or the router.
 *
 * @returns A registry object with methods to register and retrieve handlers with full type safety
 *
 * @example
 * ```typescript
 * // Create a registry and register handlers
 * const registry = createHandlerRegistry()
 *   .register('flamingo', helloRouter)
 *   .register('users', userRouter);
 *
 * // Get handlers with full type safety
 * const flamingoHandler = registry.get('flamingo');
 * const validRequest = flamingoHandler.getRequest('SayHelloReq'); // ✓ Type-safe!
 * // const invalid = flamingoHandler.getRequest('IDontExist');    // ✗ Type error!
 * ```
 *
 * @since 0.8.0
 */
export function createRpcGroupRegistry<
  T extends Record<RegistryKey, RpcGroup.RpcGroup<any>> = {},
>() {
  function createRegistryWithHandlers<T extends Record<RegistryKey, RpcGroup.RpcGroup<any>>>(
    handlers: T,
  ) {
    const registry = {
      /**
       * Register a new handler with the given tag
       */
      registerGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        handler: V,
      ) {
        if (tag in handlers) {
          throw new Error(`RPC group with tag "${tag}" already exists`);
        }

        const newHandlers = { ...handlers, [tag]: handler } as T & Record<K, V>;
        return createRegistryWithHandlers(newHandlers);
      },
      registerGetGroup<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        handler: V,
      ) {
        const a = registry.registerGroup(tag, handler);
        return a.get(tag);
      },

      /**
       * Get a handler by its tag with full type safety
       */
      get<K extends keyof T & string>(tag: K): TaggedHandler<K, T[K]> {
        if (!(tag in handlers)) {
          throw new Error(`RPC group with tag "${String(tag)}" not found`);
        }
        const handler = handlers[tag];
        if (!handler) {
          throw new Error(`RPC group with tag "${String(tag)}" not found`);
        }
        return createTaggedHandler(tag, handler) as TaggedHandler<K, T[K]>;
      },

      /**
       * Check if a handler exists
       */
      has<K extends string>(tag: K): tag is K & keyof T {
        return tag in handlers;
      },

      /**
       * Get all registered tags
       */
      getTags(): (keyof T)[] {
        return Object.keys(handlers) as (keyof T)[];
      },
    };

    return registry;
  }

  return createRegistryWithHandlers({} as T);
}

/**
 * Registers a new `RpcGroup` with the given tag in the global registry.
 *
 * Note: For full type safety, consider using `createHandlerRegistry()` instead.
 * This global registration approach provides runtime functionality but limited type safety.
 *
 * @param tag The unique tag for the handler
 * @param handler The RPC group handler to register
 * @returns The registered tagged handler
 *
 * @example
 * ```typescript
 * const helloRouter = RpcGroup.make(
 *   Rpc.fromTaggedRequest(SayHelloReq),
 *   Rpc.fromTaggedRequest(SayByeReq),
 * );
 *
 * const flamingoHandler = registerHandler('flamingo', helloRouter);
 * ```
 *
 * @since 0.8.0
 */
export function registerHandler<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
  tag: K,
  handler: V,
): TaggedHandler<K, V> {
  if (__globalRegistry.has(tag)) {
    throw new Error(`RPC group with tag "${tag}" already exists`);
  }

  const taggedHandler = createTaggedHandler(tag, handler);
  __globalRegistry.set(tag, taggedHandler);

  return taggedHandler;
}

/**
 * Retrieves a registered handler from the global registry.
 *
 * Note: For full type safety, consider using `createHandlerRegistry()` instead.
 * This global retrieval approach provides runtime functionality but limited type safety.
 *
 * @param name The tag of the handler to retrieve
 * @returns The tagged handler
 *
 * @example
 * ```typescript
 * const handler = getHandler('flamingo');
 * ```
 */
// export function getHandler<K extends string>(name: K): TaggedHandler<K, RpcGroup.RpcGroup<any>> {
//   const handler = __globalRegistry.get(name);
//   if (!handler) {
//     throw new Error(`RPC group with tag "${name}" not found`);
//   }
//   return handler;
// }
