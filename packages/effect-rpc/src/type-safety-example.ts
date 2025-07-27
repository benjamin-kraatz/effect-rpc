/**
 * Example demonstrating both the type-safe registry pattern and the global handler approach
 */
import { Rpc, RpcGroup } from '@effect/rpc';
import * as S from 'effect/Schema';
import { createRpcGroupRegistry, registerHandler } from './registry';

export class SayHelloReq extends S.TaggedRequest<SayHelloReq>('SayHelloReq')('SayHelloReq', {
  payload: { name: S.NonEmptyString },
  success: S.NonEmptyString,
  failure: S.Never,
}) {}

export class SayByeReq extends S.TaggedRequest<SayByeReq>('SayByeReq')('SayByeReq', {
  payload: { name: S.NonEmptyString },
  success: S.NonEmptyString,
  failure: S.Never,
}) {}

export const helloRouter = RpcGroup.make(
  Rpc.fromTaggedRequest(SayHelloReq),
  Rpc.fromTaggedRequest(SayByeReq),
);

// ===== APPROACH 1: Type-safe registry (RECOMMENDED) =====
// This approach provides full type safety with zero manual augmentation!

const registry = createRpcGroupRegistry().registerGroup('flamingo', helloRouter);

// Full type safety! TypeScript knows exactly what requests are available:
const typeSafeHandler = registry.get('flamingo');
const typeSafeValidRequest = typeSafeHandler.getRequest('SayHelloReq', { name: 'Alice' }); // ✓ Type-safe!
// const typeSafeInvalidRequest = typeSafeHandler.getRequest('IDontExist'); // ✗ Type error!

// ===== APPROACH 2: Global registry (legacy support) =====
// This approach provides runtime functionality but limited type safety

const flamingoHandler = registerHandler('flamingo', helloRouter);
const handlerSelf = flamingoHandler.handlers;
const requests = flamingoHandler.getRequests();
const requestNames = requests.map((req) => req.name);
const requestClient = flamingoHandler.getRequest('SayHelloReq', { name: 'Bob' });

// const r = getHandler("flamingo").getRequest("SayHelloReq") // <- works but limited type safety;
// const r2 = getHandler("flamingo").getRequest("IDontExist") // <- no type error with global approach;
