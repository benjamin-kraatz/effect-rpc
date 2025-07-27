import { RpcClient, type RpcGroup } from '@effect/rpc';
import * as Effect from 'effect/Effect';
import { type InferClient } from './helpers';

type RegistryKey = string;

/**
 * Creates a type-safe handler registry that maintains type relationships without module augmentation.
 * Uses a builder pattern to accumulate handlers and their types.
 *
 * @returns An object with methods to register and retrieve handlers with full type safety
 *
 * @example
 * ```typescript
 * const registry = createHandlerRegistry()
 *   .register('flamingo', helloRouter)
 *   .register('users', userRouter);
 *
 * const helloHandler = registry.get('flamingo');
 * //    ^ Type: typeof helloRouter (fully type-safe!)
 *
 * const userHandler = registry.get('users');
 * //    ^ Type: typeof userRouter (fully type-safe!)
 * ```
 *
 * @since 0.8.0
 *
 * @internal
 */
function createHandlerRegistry() {
  function createRegistryWithHandlers<T extends Record<RegistryKey, RpcGroup.RpcGroup<any>>>(
    handlers: T,
  ) {
    const registry = {
      /**
       * Register a new handler with the given tag
       */
      register<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        handler: V,
      ) {
        if (tag in handlers) {
          throw new Error(`RPC group with tag "${tag}" already exists`);
        }

        const newHandlers = { ...handlers, [tag]: handler } as T & Record<K, V>;
        return createRegistryWithHandlers(newHandlers);
      },

      /**
       * Get a handler by its tag with full type safety
       */
      get<K extends keyof T>(tag: K): T[K] {
        if (!(tag in handlers)) {
          throw new Error(`RPC group with tag "${String(tag)}" not found`);
        }
        return handlers[tag];
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

  return createRegistryWithHandlers({});
}

export type TaggedHandler<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>> = {
  tag: K;
  handlers: V;
  getRequests: () => Array<V extends { requests: ReadonlyMap<string, infer R> } ? R : never>;
  getRequest: <N extends keyof InferClient<V>, R extends RpcClient.Protocol>(
    name: N,
  ) => Effect.Effect<InferClient<V>[N], never, R>;
};

export function registerHandler<K extends RegistryKey, V extends RpcGroup.RpcGroup<any>>(
  tag: K,
  handler: V,
): TaggedHandler<K, V> {
  return {
    tag,
    handlers: handler,
    getRequests: () => {
      const requests = handler.requests;
      return Array.from(requests.values()) as Array<
        V extends { requests: ReadonlyMap<string, infer R> } ? R : never
      >;
    },
    getRequest: <N extends keyof InferClient<V>, R extends RpcClient.Protocol>(name: N) => {
      return Effect.gen(function* () {
        const client = yield* RpcClient.make(handler);
        if (!(name in client)) {
          throw new Error(`Request "${String(name)}" not found`);
        }
        return client[name] as InferClient<V>[N];
      }).pipe(Effect.scoped) as Effect.Effect<InferClient<V>[N], never, R>;
    },
  };
}
