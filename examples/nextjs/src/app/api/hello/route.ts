import { helloRouter } from "@/lib/rpc/hello/requests";
import { HelloService } from "@/lib/rpc/hello/service";
import { createRPCHandler } from "effect-rpc";

const handler = createRPCHandler(
  helloRouter,
  {
    SayByeReq: ({ name }) => HelloService.sayBye(name),
    SayHelloReq: ({ name }) => HelloService.sayHello(name),
  },
  HelloService.Default
);

export const POST = async (request: Request) => {
  try {
    return await handler(request);
  } catch (error) {
    console.error("Error in hello API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
