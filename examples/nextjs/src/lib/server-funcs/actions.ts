"use server";

import { makeRequest, makeServerRequest } from "effect-rpc";
import { helloRouter } from "../rpc/hello/requests";
import { AppRuntime } from "../runtime";

export async function greetUserServerSide(name: string): Promise<string> {
  const mr = await makeRequest("@/hello/SayHelloRequests", "Sa");
  const request = makeServerRequest(helloRouter, "SayHelloReq", { name });
  return AppRuntime.runPromise(request);
}
