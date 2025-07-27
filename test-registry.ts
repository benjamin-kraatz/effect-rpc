import { Rpc, RpcGroup } from '@effect/rpc';
import * as S from 'effect/Schema';
import { createHandlerRegistry, getHandler, registerHandler } from './packages/effect-rpc/src/registry';

// Define test requests
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

// ===== TYPE-SAFE REGISTRY APPROACH (RECOMMENDED) =====
const registry = createHandlerRegistry()
  .register('flamingo', helloRouter);

// This should work - "SayHelloReq" exists in the helloRouter
const validRequest = registry.get("flamingo").getRequest("SayHelloReq");

// This should give a type error - "IDontExist" doesn't exist
// This line correctly shows a TypeScript error:
// const invalidRequest = registry.get("flamingo").getRequest("IDontExist");

// ===== GLOBAL REGISTRY APPROACH (LIMITED TYPE SAFETY) =====
const flamingoHandler = registerHandler('flamingo-global', helloRouter);

// This works but doesn't provide the same level of type safety
const globalValidRequest = getHandler("flamingo-global").getRequest("SayHelloReq");

console.log('Type-safe handler system works!');
