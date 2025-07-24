import { createServerFileRoute } from "@tanstack/react-start/server";
import { createRPCHandler } from "effect-rpc";
import { helloRouter } from "~/lib/rpc/hello/requests";
import { HelloService } from "~/lib/rpc/hello/service";

const handler = createRPCHandler(
  helloRouter,
  {
    SayByeReq: ({ name }) => HelloService.sayBye(name),
    SayHelloReq: ({ name }) => HelloService.sayHello(name),
  },
  { serviceLayers: HelloService.Default }
);

export const ServerRoute = createServerFileRoute("/api/hello").methods({
  POST: async ({ request }) => {
    return handler(request);
  },
});
