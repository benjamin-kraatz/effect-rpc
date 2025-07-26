import { RpcSerialization } from "@effect/rpc";
import { Layer, ManagedRuntime } from "effect";
import { createEffectRPC, createRuntime } from "effect-rpc";

export const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    createEffectRPC({
      url: "http://localhost:3000/api/hello",
      serialization: RpcSerialization.layerMsgPack,
    })
    // AuthClientLive // if there's an auth middleware, for example
  )
);

// You can also create a runtime directly, with optional serialization and additional layers
const sampleLayer = Layer.empty;
const anotherLayer = createRuntime({
  url: "http://localhost:3000/api/another",
  serialization: RpcSerialization.layerNdjson,
  additionalLayers: [sampleLayer],
});
