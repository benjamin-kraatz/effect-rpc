import { FetchHttpClient, HttpServer } from '@effect/platform';
import { RpcClient, RpcSerialization } from '@effect/rpc';
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
 * Creates an array of tagged requests for RPC communication for a given namespace tag.
 * It allows you to globally register requests to re-use them across your application,
 * for example, when you do actual requests to the server with the RPC client.
 *
 * **NOTE**: requests are stored globally in memory, and the {@link tag} _must_ be unique.
 * If you create requests with the same tag, it will throw an error.
 * Best practice is to use an import-path-style string, such as `@/main/MyRequests`,
 * or the file path of the file where the requests are defined.
 *
 * For type safety with makeRequest, consider augmenting the GlobalRequestRegistry:
 *
 * @example
 * ```typescript
 * declare module "effect-rpc" {
 *   interface GlobalRequestRegistry {
 *     "@/hello/SayHelloRequests": "SayHelloReq" | "SayByeReq";
 *   }
 * }
 *
 * const requests = createRequests("@/hello/SayHelloRequests", [SayHelloReq, SayByeReq]);
 * // Now makeRequest("@/hello/SayHelloRequests", "SayHelloReq") is type-safe
 * ```
 *
 * @param tag - The tag to identify the requests.
 * @param requests - The array of requests to create.
 * @returns An array of tagged requests.
 * @throws Error if a request with the same tag already exists in the global request mapping.
 *
 * @since 0.7.0
 */
export function createRequests<R, E, I>(tag: string, requests: R[]): TaggedRequest<R>[] {
  for (const request of requests) {
    if (__globalRequestMapping.has(tag)) {
      throw new Error(`Request already exists in request mapping "${tag}"`);
    }
    __globalRequestMapping.set(tag, [
      ...(__globalRequestMapping.get(tag) ?? []),
      request as TaggedRequest<R>,
    ]);
  }

  return __globalRequestMapping.get(tag) as TaggedRequest<R>[];
}

type TaggedRequest<R> = {
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

/**
 * Global registry interface for mapping tags to their request names.
 * This allows for type-safe request names in makeRequest.
 *
 * Users should augment this interface with string literal types representing their request names:
 *
 * @example
 * ```typescript
 * declare module "effect-rpc" {
 *   interface GlobalRequestRegistry {
 *     "@/hello/SayHelloRequests": "SayHelloReq" | "SayByeReq";
 *   }
 * }
 * ```
 */
export interface GlobalRequestRegistry {
  // This will be augmented by module declaration merging
}

/**
 * Gets the valid request names for a given tag.
 * If the tag exists in GlobalRequestRegistry, returns the union of request names.
 * Otherwise, falls back to string.
 */
type RequestNamesForTag<Tag extends string> = Tag extends keyof GlobalRequestRegistry
  ? GlobalRequestRegistry[Tag]
  : string;

export async function makeRequest<Tag extends string>(
  tag: Tag,
  requestName: RequestNamesForTag<Tag>,
) {
  const mapping = __globalRequestMapping.get(tag);
  if (!mapping) {
    throw new Error(`No requests found for tag "${tag}"`);
  }
}
