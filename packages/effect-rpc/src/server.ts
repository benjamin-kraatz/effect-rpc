/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcGroup, RpcSerialization, RpcServer } from "@effect/rpc";
import type { Context } from "@effect/rpc/Rpc";
import { Effect, Layer } from "effect";
import {
  getRPCClient,
  type InferClient,
  type SerializationLayer,
} from "./helpers";
import { getServerLayers } from "./runtime";

/**
 * Creates a web-compatible handler for your RPC router and effectful service layer.
 *
 * This function merges your provided handler layer, any additional layers, and the default server layers,
 * then produces a handler suitable for use in serverless, edge, or traditional Node.js environments.
 *
 * @param router - The RPC router group defining all available endpoints.
 * @param rpcHandler - The Layer containing all endpoint implementations and their dependencies.
 * @param serialization - (Optional) The serialization layer to use for RPC communication. Defaults to `RpcSerialization.layerNdjson`.
 * @param additionalLayers - (Optional) Additional Layer instances to merge into the environment.
 * @returns A function that takes a `Request` (and optional context) and returns a `Promise<Response>`.
 *
 * @remarks
 * This is the final step for wiring up your effect-rpc API to a web framework (e.g., Next.js route handler).
 *
 * @remarks
 * You can also use the {@link createRPCHandler} function for a more streamlined approach that combines route handler creation and server setup.
 *
 * @example
 * ```typescript
 * const handlers = createRouteHandler(router, {
 *   SayHelloReq: ({ name }) => HelloService.sayHello(name),
 *   SayByeReq: ({ name }) => HelloService.sayBye(name),
 *   PingPongReq: (req) => HelloService.pingPong(req),
 * }, HelloService.Default);
 *
 * export const POST = createServerHandler(router, handlers);
 *
 * // Or use the combined createRPCHandler function for a more streamlined approach:
 * // export const POST = createRPCHandler(router, { ... }, HelloService.Default);
 * ```
 *
 * @deprecated Use {@link createRPCHandler} for a more streamlined approach that combines route handler creation and server setup.
 * This function is kept for backward compatibility but will be turned into an internal utility in the next minor version.
 */
export function createServerHandler<
  T extends RpcGroup.RpcGroup<any>,
  Routes = ExtractRoutes<T>,
>(
  router: T,
  rpcHandler: Layer.Layer<Routes, never, never>,
  serialization: SerializationLayer = RpcSerialization.layerNdjson,
  ...additionalLayers: Layer.Layer<any, any, never>[]
): (
  request: globalThis.Request,
  context?: Context<never> | undefined
) => Promise<Response> {
  const { handler } = RpcServer.toWebHandler(router, {
    layer: Layer.mergeAll(
      rpcHandler,
      getServerLayers({
        serialization,
      }),
      ...additionalLayers
    ),
  });

  return handler;
}

/**
 * Extracts the success type from an Effect.
 *
 * @internal
 */
type ExtractSuccess<T> = T extends Effect.Effect<infer A, any, any> ? A : never;

/**
 * Extracts the error type from an Effect.
 *
 * @internal
 */
type ExtractError<T> = T extends Effect.Effect<any, infer E, any> ? E : never;

/**
 * Extracts the route definitions from an RpcGroup.
 *
 * @internal
 */
type ExtractRoutes<T> =
  T extends RpcGroup.RpcGroup<infer Routes> ? Routes : never;

/**
 * Maps each RPC request to its implementation.
 * This type is used to ensure that all endpoints in the router are implemented.
 *
 * @internal
 */
type RequestImplementations<
  T extends RpcGroup.RpcGroup<any>,
  V extends InferClient<T>,
  R,
> = {
  readonly [P in keyof V]: (
    payload: Parameters<V[P]>[0]
  ) => Effect.Effect<
    ExtractSuccess<ReturnType<V[P]>>,
    ExtractError<ReturnType<V[P]>>,
    R
  >;
};

/**
 * Creates a Layer containing all RPC endpoint implementations for a given router.
 *
 * This function ensures:
 *   - All endpoints in the router are implemented (compile-time error if any are missing)
 *   - Each handler can require dependencies, which are provided via the `additionalLayers` argument
 *   - The resulting Layer is ready to be passed to {@link createServerHandler}
 *
 * @param router - The RPC router group defining all endpoints.
 * @param reqImplementations - An object mapping every endpoint name to its implementation. All endpoints are required.
 * @param additionalLayers - A Layer providing all dependencies required by the handlers (e.g., service implementations).
 * @returns A Layer suitable for use with {@link createServerHandler}.
 *
 * @remark
 * You can also use the {@link createRPCHandler} function for a more streamlined approach that combines route handler creation and server setup.
 *
 * @example
 * ```typescript
 * const handlers = createRouteHandler(router, {
 *   SayHelloReq: ({ name }) => HelloService.sayHello(name),
 *   SayByeReq: ({ name }) => HelloService.sayBye(name),
 *   PingPongReq: (req) => HelloService.pingPong(req),
 * }, HelloService.Default);
 *
 * // Pass to createServerHandler
 * export const POST = createServerHandler(router, handlers);
 * ```
 *
 * @deprecated Use {@link createRPCHandler} for a more streamlined approach that combines route handler creation and server setup.
 * This function is kept for backward compatibility but will be turned into an internal utility in the next minor version.
 */
export function createRouteHandler<
  T extends RpcGroup.RpcGroup<any>,
  V extends InferClient<T>,
  R,
>(
  router: T,
  reqImplementations: RequestImplementations<T, V, R>,
  additionalLayers: Layer.Layer<R>
): Layer.Layer<ExtractRoutes<T>, never, never> {
  // Transform the implementations to automatically provide the additional layers
  const transformedImplementations: Record<
    string,
    (payload: unknown) => Effect.Effect<any, any, never>
  > = {};

  for (const [key, impl] of Object.entries(reqImplementations)) {
    transformedImplementations[key] = (payload: unknown) => {
      const effect = (impl as (payload: unknown) => Effect.Effect<any, any, R>)(
        payload
      );
      // Automatically provide the additional layers to each implementation
      return effect.pipe(Effect.provide(additionalLayers));
    };
  }

  // We need to cast here because the router.toLayer expects exact types
  // but we're transforming the context requirements
  return router.toLayer(
    transformedImplementations as any
  ) as unknown as Layer.Layer<ExtractRoutes<T>, never, never>;
}

/**
 * Creates a web-compatible handler that combines route implementations and server setup in one function.
 *
 * This is a convenience function that internally calls both {@link createRouteHandler} and {@link createServerHandler}
 * to provide a streamlined API for creating RPC handlers.
 *
 * @param router - The RPC router group defining all available endpoints.
 * @param reqImplementations - An object mapping every endpoint name to its implementation. All endpoints are required.
 * @param config - Configuration object
 * @param config.serviceLayers - A Layer providing all dependencies required by the handlers (e.g., service implementations).
 * @param config.serialization - (Optional) The serialization layer to use for RPC communication. Defaults to `RpcSerialization.layerNdjson`.
 * @param config.additionalLayers - (Optional) Additional Layer instances to merge into the environment.
 * @returns A function that takes a `Request` (and optional context) and returns a `Promise<Response>`.
 *
 * @example
 * ```typescript
 * const handler = createRPCHandler(router, {
 *   SayHelloReq: ({ name }) => HelloService.sayHello(name),
 *   SayByeReq: ({ name }) => HelloService.sayBye(name),
 *   PingPongReq: (req) => HelloService.pingPong(req),
 * }, {
 *   serviceLayers: HelloService.Default,
 * });
 *
 * export const POST = handler;
 * ```
 *
 * @since 0.3.0
 */
export function createRPCHandler<
  T extends RpcGroup.RpcGroup<any>,
  V extends InferClient<T>,
  R,
>(
  router: T,
  reqImplementations: RequestImplementations<T, V, R>,
  config: {
    /**
     * The Layer providing all dependencies required by the handlers (e.g., service implementations).
     * This is typically the default service layer for the service being used.
     */
    serviceLayers: Layer.Layer<R>;
    /**
     * The serialization layer to use for RPC communication.
     * Defaults to `RpcSerialization.layerNdjson`.
     * Must be of type {@link SerializationLayer}.
     * If you use a custom serialization layer, make sure it is compatible with the RPC server you are communicating with.
     * This means, you most likely want to modify the {@link createEffectRPC} function invocation to use the same serialization layer!
     */
    serialization?: SerializationLayer;
    /**
     * Additional Layer instances to merge into the environment.
     * This can be used to provide additional dependencies required by the handlers,
     * such as authentication middleware or other services.
     * This is optional and can be omitted or an empty array if no additional layers are needed.
     */
    additionalLayers?: Layer.Layer<any, any, never>[];
  }
): (
  request: globalThis.Request,
  context?: Context<never> | undefined
) => Promise<Response> {
  const routeHandlers = createRouteHandler(
    router,
    reqImplementations,
    config.serviceLayers
  );
  return createServerHandler(
    router,
    routeHandlers,
    config.serialization,
    ...(config.additionalLayers || [])
  );
}

/**
 * Creates a server-side handler for a specific RPC request within a given RPC group,
 * immediately invoking the RPC endpoint with the provided payload and returning the result Effect.
 *
 * @template T - The type representing the RPC group.
 * @template K - The key of the RPC method within the group.
 *
 * @param rpcGroup - The RPC group containing the available RPC methods.
 * @param requestName - The name of the RPC method to handle.
 * @param payload - The payload to send to the specified RPC method.
 * @returns The Effect returned by invoking the RPC endpoint with the given payload.
 *
 * @remarks
 * This utility is intended for server-side usage to facilitate handling of typed RPC requests.
 * The returned Effect enforces the correct payload and return types based on the RPC group definition.
 * It wraps the same client as {@link useRPCRequest}, but immediately invokes the endpoint with the payload.
 *
 * @example
 * ```typescript
 * const userEffect = makeServerRequest(userRpcGroup, "getUser", { id: "123" });
 * // userEffect is an Effect representing the result of the getUser RPC method.
 * ```
 *
 * @since 0.3.0
 */
export function makeServerRequest<
  T extends RpcGroup.RpcGroup<any>,
  K extends keyof InferClient<T>,
>(rpcGroup: T, requestName: K, payload: Parameters<InferClient<T>[K]>[0]) {
  const request = getRPCClient(rpcGroup, requestName);
  return request(payload);
}
