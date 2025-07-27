'use server';

import { makeServerRequest } from 'effect-rpc';
import { helloRouter } from '../rpc/hello/requests';
import { AppRuntime } from '../runtime';
import { sayRequests } from '../rpc/hello/requests';

export async function greetUserServerSide(name: string): Promise<string> {
  const mr = sayRequests.makeRequest('SayHelloReq');
  const request = makeServerRequest(helloRouter, 'SayHelloReq', { name });
  return AppRuntime.runPromise(request);
}
