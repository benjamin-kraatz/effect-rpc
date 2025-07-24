import { RpcSerialization } from "@effect/rpc";
import { Layer, ManagedRuntime } from "effect";
import { createEffectRPC, makeRPCBackendLayer } from "effect-rpc";

export const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    createEffectRPC({
      url: "http://localhost:3000/api/hello",
      serialization: RpcSerialization.layerMsgPack,
    })
    // AuthClientLive // if there's an auth middleware, for example
  )
);
