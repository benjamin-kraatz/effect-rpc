import { FetchHttpClient, HttpServer } from "@effect/platform";
import { RpcClient, RpcSerialization } from "@effect/rpc";
import * as Layer from "effect/Layer";

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
export function makeRPCBackendLayer(config: {
  url: string;
  endpoint?: string;
}) {
  return createEffectRPC(config);
}

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
 * - This function will allow for using custom serialization formats and protocols in the future.
 *
 * @example
 * ```typescript
 * const backend = createEffectRPC({ url: "https://api.example.com", endpoint: "/rpc" });
 * ```
 *
 * @since 0.5.0
 */
export function createEffectRPC(config: { url: string; endpoint?: string }) {
  return RpcClient.layerProtocolHttp({
    url: `${config.url}${config.endpoint ?? ""}`,
  }).pipe(
    Layer.provide([
      // use fetch for http requests
      FetchHttpClient.layer,
      // use ndjson for serialization
      RpcSerialization.layerNdjson,
    ])
  );
}

/**
 * Constructs and returns a merged `Layer` composed of several essential server-side layers,
 * along with any additional layers provided as arguments.
 *
 * This function is typically used to assemble the foundational infrastructure required for
 * server-side effectful RPC (Remote Procedure Call) operations. It merges the following layers:
 *
 * - `RpcSerialization.layerNdjson`: Provides NDJSON-based serialization for RPC communication.
 * - `FetchHttpClient.layer`: Supplies an HTTP client implementation based on the Fetch API.
 * - `HttpServer.layerContext`: Sets up the HTTP server context required for handling requests.
 * - Any additional layers passed via the `additionalLayers` parameter.
 *
 * You should use these when you want to handle the RPC endpoints in Next.js Route Handlers.
 *
 * @param additionalLayers - An optional list of additional `Layer` instances to be merged with the default server layers.
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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We have to use `any`; there's no way around it
export function getServerLayers(...additionalLayers: Layer.Layer<any>[]) {
  return Layer.mergeAll(
    RpcSerialization.layerNdjson,
    FetchHttpClient.layer,
    HttpServer.layerContext,
    ...additionalLayers
  );
}
