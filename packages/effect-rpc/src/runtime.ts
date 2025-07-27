import { FetchHttpClient, HttpServer } from '@effect/platform';
import { Rpc, RpcClient, RpcGroup, RpcSerialization } from '@effect/rpc';
import * as Layer from 'effect/Layer';
import * as Schema from 'effect/Schema';
import type { SerializationLayer } from './helpers';
import { ManagedRuntime } from 'effect';

/**
 * Creates an RPC backend layer using HTTP protocol.
 *
 * This function constructs a layered RPC client configured to communicate
 * with a remote endpoint over HTTP. It uses the Fetch API for HTTP requests
 * and NDJSON for request/response serialization.
 *
 * @param config - Configuration object for the RPC backend.
 * @param config.url - The base URL of the RPC server.
 * @param config.endpoint - (Optional) The specific endpoint path to append to the base URL.
 *
 * @returns A Layer instance that provides the configured RPC client.
 *
 * @remarks
 * - The returned layer is composed with:
 *   - `FetchHttpClient.layer` for HTTP transport using the Fetch API.
 *   - `RpcSerialization.layerNdjson` for NDJSON serialization.
 * - The endpoint is appended to the base URL if provided.
 *
 * @example
 * ```typescript
 * const backend = makeRPCBackendLayer({ url: "https://api.example.com", endpoint: "/rpc" });
 * ```
 *
 * @deprecated Use {@link createEffectRPC} instead. It does the same thing, but with a more descriptive name.
 */
export function makeRPCBackendLayer(config: { url: string; endpoint?: string }) {
  return createEffectRPC(config);
}

/**
 * Creates an RPC backend layer using HTTP protocol.
 *
 * This function constructs a layered RPC client configured to communicate
 * with a remote endpoint over HTTP. It uses the Fetch API for HTTP requests
 * and NDJSON for request/response serialization by default, but you can use
 * a custom serialization layer from `RpcSerialization`.
 *
 * **NOTE**: Make sure that, if you use a custom serialization layer, it is compatible with the RPC server you are communicating with.
 * This means, you most likely want to modify the {@link getServerLayers} function invocation to use the same serialization layer!
 *
 * @param config - Configuration object for the RPC backend.
 * @param config.url - The base URL of the RPC server.
 * @param config.endpoint - (Optional) The specific endpoint path to append to the base URL.
 * @param config.serialization - (Optional) Custom serialization layer to use for RPC communication of type `SerializationLayer`.
 *
 * @returns A Layer instance that provides the configured RPC client.
 *
 * @remarks
 * - The default returned layer is composed with:
 *   - `FetchHttpClient.layer` for HTTP transport using the Fetch API.
 *   - `RpcSerialization.layerNdjson` for NDJSON serialization.
 * - The endpoint is appended to the base URL if provided.
 *
 * @example
 * ```typescript
 * const backend = createEffectRPC({ url: "https://api.example.com", endpoint: "/rpc" });
 * ```
 *
 * @example
 * ```typescript
 * // With a custom serialization layer
 * import { RpcSerialization } from "@effect/rpc";
 * const backend = createEffectRPC({
 *   url: "https://api.example.com",
 *   endpoint: "/rpc",
 *   serialization: RpcSerialization.layerJson,
 * });
 * ```
 *
 * @since 0.5.0
 */
export function createEffectRPC(config: {
  url: string;
  endpoint?: string;
  serialization?: SerializationLayer;
}): Layer.Layer<RpcClient.Protocol, never, never> {
  return RpcClient.layerProtocolHttp({
    url: `${config.url}${config.endpoint ?? ''}`,
  }).pipe(
    Layer.provide([
      // use fetch for http requests
      FetchHttpClient.layer,
      config.serialization ?? RpcSerialization.layerNdjson,
    ]),
  );
}

/**
 * Creates a Effect Runtime for RPC communication with a specified URL and optional serialization.
 * This function is useful for setting up a runtime environment without sticking it together with
 * all the other parts.
 * It's a convenience function over {@link createEffectRPC} and {@link getServerLayers} and potentially others.
 *
 * You can give it any additional layers that the runtime should have.
 *
 * @param config - Configuration object for the RPC runtime.
 * @param config.url - The base URL of the RPC server.
 * @param config.serialization - (Optional) Custom serialization layer to use for RPC communication of type `SerializationLayer`.
 * Defaults to `RpcSerialization.layerNdjson`.
 * @param config.additionalLayers - (Optional) Additional layers to merge with the RPC client layer.
 *
 * @see {@link createEffectRPC}
 * @see {@link getServerLayers}
 *
 * @example
 * ```typescript
 * const runtime = createRuntime({
 *   url: "https://my-rpc-server.com",
 *   serialization: MyCustomSerializationLayer,
 *   additionalLayers: [MyCustomLayer]
 * });
 * ```
 *
 * @since 0.7.0
 */
export function createRuntime<R, E>({
  url,
  serialization,
  additionalLayers,
}: {
  url: string;
  serialization?: SerializationLayer;
  additionalLayers?: Layer.Layer<R, E, never>[];
}): ManagedRuntime.ManagedRuntime<RpcClient.Protocol | R, E> {
  return ManagedRuntime.make(
    Layer.mergeAll(
      createEffectRPC({
        url,
        serialization: serialization ?? RpcSerialization.layerNdjson,
      }),
      ...(additionalLayers ?? []),
    ),
  );
}

/**
 * Constructs and returns a merged `Layer` composed of several essential server-side layers,
 * along with any additional layers provided as arguments.
 *
 * This function is typically used to assemble the foundational infrastructure required for
 * server-side effectful RPC (Remote Procedure Call) operations. It merges the following layers by default:
 *
 * - `RpcSerialization.layerNdjson`: Provides NDJSON-based serialization for RPC communication.
 * - `FetchHttpClient.layer`: Supplies an HTTP client implementation based on the Fetch API.
 * - `HttpServer.layerContext`: Sets up the HTTP server context required for handling requests.
 * - Any additional layers passed via the `additionalLayers` parameter.
 *
 * You can customize the following aspects:
 * - The serialization layer used for RPC communication by providing a custom `serialization` property. Must be of type {@link SerializationLayer}.
 *
 * You should use these when you want to handle the RPC endpoints in Next.js Route Handlers.
 *
 * **NOTE**: If you use a custom serialization layer, make sure it is compatible with the RPC server you are communicating with.
 * This means, you most likely want to modify the {@link createEffectRPC} function invocation to use the same serialization layer!
 *
 * @param config - Configuration object for the server layers.
 * @param config.additionalLayers - An optional list of additional `Layer` instances to be merged with the default server layers.
 * For example, you might want to pass a custom live implementation of a middleware.
 * @returns A single `Layer` instance representing the merged server infrastructure.
 *
 * @template T - The type of the additional layers' environment.
 *
 * @example
 * ```typescript
 * const serverLayers = getServerLayers(MyCustomLayer);
 * ```
 *
 * @example
 * ```typescript
 * const authMiddlewareLayer = AuthMiddleware.Default;
 * const serverLayers = getServerLayers(authMiddlewareLayer, Layer.succeed(authMiddlewareLayer));
 * ```
 *
 * @example
 * ```typescript
 * // With a custom serialization layer
 * import { RpcSerialization } from "@effect/rpc";
 * const serverLayers = getServerLayers(authMiddlewareLayer, Layer.succeed(authMiddlewareLayer));
 * ```
 *
 * @since 0.3.0
 */
export function getServerLayers(
  config: {
    serialization?: SerializationLayer;
    additionalLayers?: Layer.Layer<any, any, never>[];
  } = { additionalLayers: [] },
) {
  return Layer.mergeAll(
    config.serialization ?? RpcSerialization.layerNdjson,
    FetchHttpClient.layer,
    HttpServer.layerContext,
    ...(config.additionalLayers ?? []),
  );
}

/**
 * A simple type-safe request registry that doesn't require module augmentation.
 * The type safety is achieved through the return type of createRequests.
 */
export interface RequestRegistry<T extends Record<string, any> = Record<string, any>> {
  makeRequest<K extends keyof T>(name: K): T[K];
  getTag(): string;
}

/**
 * Creates a type-safe registry of tagged requests for RPC communication.
 * Returns a registry object with a makeRequest method that provides full type safety.
 *
 * @example
 * ```typescript
 * const helloRequests = createRequests("@/hello/SayHelloRequests", {
 *   SayHelloReq,
 *   SayByeReq,
 * });
 *
 * // Fully type-safe - TypeScript knows this returns SayHelloReq
 * const request = helloRequests.makeRequest("SayHelloReq");
 * ```
 *
 * @param tag - The tag to identify the requests.
 * @param requests - An object mapping request names to request constructors.
 * @returns A type-safe registry with a makeRequest method.
 * @throws Error if a request with the same tag already exists.
 *
 * @since 0.7.0
 */
export function createRequests<T extends Record<string, any>>(
  tag: string,
  requests: T,
): RequestRegistry<T> {
  if (__globalRequestMapping.has(tag)) {
    throw new Error(`Request already exists in request mapping "${tag}"`);
  }

  const requestArray = Object.entries(requests).map(([name, request]) => ({
    ...request,
    _tag: name,
  })) as TaggedRequest<any>[];

  __globalRequestMapping.set(tag, requestArray);

  return {
    makeRequest<K extends keyof T>(name: K): T[K] {
      const mapping = __globalRequestMapping.get(tag);
      if (!mapping) {
        throw new Error(`No requests found for tag "${tag}"`);
      }

      const request = mapping.find((req) => req._tag === (name as string));
      if (!request) {
        throw new Error(`Request "${name as string}" not found for tag "${tag}"`);
      }
      return request as T[K];
    },
    getTag() {
      return tag;
    },
  };
}

type TaggedRequest<R> = {
  _tag: string;
} & {
  [K in keyof R]: R[K] extends Schema.TaggedRequest<
    infer Tag,
    infer A,
    infer I,
    infer R0,
    infer SuccessType,
    infer SuccessEncoded,
    infer FailureType,
    infer FailureEncoded,
    infer ResultR
  >
    ? Schema.TaggedRequest<
        Tag,
        A,
        I,
        R0,
        SuccessType,
        SuccessEncoded,
        FailureType,
        FailureEncoded,
        ResultR
      >
    : never;
};

const __globalRequestMapping = new Map<string, TaggedRequest<any>[]>();

type Tag = string;

// This will hold the actual type mapping at runtime
const __globalGroupMapping = new Map<Tag, RpcGroup.RpcGroup<any>>();

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
 */
export function createHandlerRegistry() {
  function createRegistryWithHandlers<T extends Record<string, RpcGroup.RpcGroup<any>>>(handlers: T) {
    const registry = {
      /**
       * Register a new handler with the given tag
       */
      register<K extends string, V extends RpcGroup.RpcGroup<any>>(
        tag: K extends keyof T ? never : K,
        handler: V
      ) {
        if (tag in handlers) {
          throw new Error(`RPC group with tag "${tag}" already exists`);
        }
        
        const newHandlers = { ...handlers, [tag]: handler } as T & Record<K, V>;
        // Also register globally for backward compatibility
        __globalGroupMapping.set(tag, handler);
        
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
      }
    };
    
    return registry;
  }
  
  return createRegistryWithHandlers({});
}

// Legacy global functions for backward compatibility
/**
 * Creates and registers an RPC handler with a specific tag.
 * 
 * @deprecated Consider using createHandlerRegistry() for better type safety without module augmentation.
 * 
 * @param tag - Unique identifier for the RPC handler
 * @param rpcGroup - The RPC group/router to register
 * @returns The same RPC group that was passed in
 * 
 * @example
 * ```typescript
 * const helloHandler = createHandler('flamingo', helloRouter);
 * ```
 */
export function createHandler<T extends RpcGroup.RpcGroup<any>, TagName extends string>(
  tag: TagName,
  rpcGroup: T,
): T;

// Implementation
export function createHandler<T extends RpcGroup.RpcGroup<any>>(tag: Tag, rpcGroup: T) {
  if (__globalGroupMapping.has(tag)) {
    throw new Error(`RPC group with tag "${tag}" already exists`);
  }
  __globalGroupMapping.set(tag, rpcGroup);
  return rpcGroup;
}

/**
 * Retrieves a previously registered RPC handler by its tag.
 * 
 * @deprecated Consider using createHandlerRegistry() for better type safety without module augmentation.
 * 
 * @param tag - The tag used when the handler was created
 * @returns The RPC handler associated with the tag (returns RpcGroup.RpcGroup<any>)
 * 
 * @example
 * ```typescript
 * const handler = getHandler('flamingo'); // RpcGroup.RpcGroup<any>
 * ```
 */
export function getHandler(tag: string): RpcGroup.RpcGroup<any> {
  const handler = __globalGroupMapping.get(tag);
  if (!handler) {
    throw new Error(`RPC group with tag "${tag}" not found`);
  }
  return handler;
}
