import { Layer, ManagedRuntime } from "effect";
import { makeRPCBackendLayer } from "effect-rpc";

export const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    makeRPCBackendLayer({ url: "http://localhost:3000/api/hello" })
    // AuthClientLive // if there's an auth middleware, for example
  )
);
