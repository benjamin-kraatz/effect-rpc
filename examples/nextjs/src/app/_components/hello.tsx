"use client";

import { helloRouter } from "@/lib/rpc/hello/requests";
import { AppRuntime } from "@/lib/runtime";
import { useRPCRequest } from "effect-rpc";
import { Effect } from "effect";

export function GreetUserButton() {
  const sayHello = useRPCRequest(helloRouter, "SayHelloReq");

  const greet = async () => {
    const greetPhraseProgram = sayHello({ name: "Ben" });
    greetPhraseProgram.pipe(
      Effect.catchTags({
        SayHelloFailedError: (error) =>
          Effect.succeed(`Error in SayHello: ${error.message}`),
      })
    );
    alert(greetPhraseProgram.pipe(AppRuntime.runPromise));
  };

  return <button onClick={greet}>Greet me!</button>;
}
