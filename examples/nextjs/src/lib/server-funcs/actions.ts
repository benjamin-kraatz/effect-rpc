'use server';

import { helloRequests } from '../rpc/hello/requests';
import { AppRuntime } from '../runtime';

export async function greetUserServerSide(name: string): Promise<string> {
  // Use makeServerRequest for server-side RPC calls without HTTP
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
