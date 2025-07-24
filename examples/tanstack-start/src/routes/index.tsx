import { createFileRoute } from "@tanstack/react-router";
import { makeServerRequest } from "effect-rpc";
import { ByeButton } from "~/components/bye-button";
import { helloRouter } from "~/lib/rpc/hello/requests";
import { AppRuntime } from "~/lib/runtime";
export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const request = makeServerRequest(helloRouter, "SayHelloReq", {
      name: "World",
    });
    const greetPhrase = await AppRuntime.runPromise(request);
    return greetPhrase;
  },
});

function Home() {
  const greetPhrase = Route.useLoaderData();
  return (
    <div className="p-2">
      <h3>{greetPhrase}</h3>
      <div className="h-8" />
      <span className="me-1">Now say bye:</span>
      <ByeButton />
    </div>
  );
}
