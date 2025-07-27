'use server';

import { makeServerRequest } from 'effect-rpc';
import { helloRequests, helloRouter } from '../rpc/hello/requests';
import { AppRuntime } from '../runtime';

export async function greetUserServerSideWithLegacyApproach(name: string): Promise<string> {
  // With the legacy approach, you pass the RPC group to the `makeServerRequest` functions.
  const program = makeServerRequest(helloRouter, 'SayHelloReq', { name });

  try {
    const result = await AppRuntime.runPromise(program);
    console.log('Server-side RPC result:', result);
    return result;
  } catch (error) {
    console.error('Error in greetUserServerSide:', error);
    throw new Error('Failed to greet user');
  }
}

export async function greetUserServerSideWithRegistryApproach(name: string): Promise<string> {
  // Simply access the hello requests, select the name and pass its parameters.
  const program = helloRequests.getRequest('SayHelloReq', { name });

  try {
    const result = await AppRuntime.runPromise(program);
    console.log('Server-side RPC result:', result);
    return result;
  } catch (error) {
    console.error('Error in greetUserServerSide:', error);
    throw new Error('Failed to greet user');
  }
}
