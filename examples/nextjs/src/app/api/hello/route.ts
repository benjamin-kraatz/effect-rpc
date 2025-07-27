import { helloRequests, helloRouter } from '@/lib/rpc/hello/requests';
import { HelloService } from '@/lib/rpc/hello/service';
import { RpcSerialization } from '@effect/rpc';
import { createRPCHandler } from 'effect-rpc';

const handler = createRPCHandler(
  helloRouter,
  {
    SayByeReq: ({ name }) => HelloService.sayBye(name),
    SayHelloReq: ({ name }) => HelloService.sayHello(name),
  },
  {
    serviceLayers: HelloService.Default,
    serialization: RpcSerialization.layerNdjson,
  },
);

// Approach using the registry to create a server handler.
// It does the same as the above, but is more type-safe and purpose/entity-bound.
const handlerRegistry = helloRequests.createServerHandler(
  {
    SayByeReq: ({ name }) => HelloService.sayBye(name),
    SayHelloReq: ({ name }) => HelloService.sayHello(name),
  },
  {
    serviceLayers: HelloService.Default,
    serialization: RpcSerialization.layerNdjson,
  },
);

export const POST = async (request: Request) => {
  try {
    return await handler(request);
  } catch (error) {
    console.error('Error in hello API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
};
