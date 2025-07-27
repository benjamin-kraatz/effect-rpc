import { RpcSerialization } from '@effect/rpc';
import { Layer, ManagedRuntime } from 'effect';
import { createEffectRPC, createRuntime } from 'effect-rpc';

export const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    createEffectRPC({
      url: 'http://localhost:3000/api/hello',
      serialization: RpcSerialization.layerNdjson,
    }),
    // AuthClientLive // if there's an auth middleware, for example
  ),
);

// It also works with the "createRuntime" function to make it less verbose
const sampleLayer = Layer.empty;
export const AppRuntime2 = createRuntime({
  url: 'http://localhost:3000/api/hello',
  serialization: RpcSerialization.layerMsgPack,
  additionalLayers: [
    sampleLayer, // any additional layers you want to merge
  ],
});
