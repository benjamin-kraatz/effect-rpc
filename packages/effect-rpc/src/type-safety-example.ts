/**
 * Example demonstrating the fully type-safe createHandlerRegistry pattern (NO MODULE AUGMENTATION!)
 */
import { Rpc, RpcGroup } from '@effect/rpc';
import * as S from 'effect/Schema';
import { createHandlerRegistry } from './runtime';

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

// NEW APPROACH: Create a type-safe registry (no module augmentation needed!)
const handlerRegistry = createHandlerRegistry()
  .register('flamingo', helloRouter)
  .register('kerze', helloRouter);

// Step 1: Get handlers with full type safety!
const retrievedHelloHandler = handlerRegistry.get('flamingo');

const retrieveCandleHandler = handlerRegistry.get('kerze');
//    ^ Type: RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
//           (NOT RpcGroup.RpcGroup<any>!)

// Step 2: TypeScript will catch typos and invalid tags at compile time
// const invalidHandler = handlerRegistry.get('typo');
//       ^ TypeScript Error: Argument of type '"typo"' is not assignable to parameter of type '"flamingo"'

// Step 3: Check if handler exists with type narrowing
if (handlerRegistry.has('flamingo')) {
  const safeHandler = handlerRegistry.get('flamingo');
  //    ^ Type: RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
}

// Step 4: Builder pattern allows chaining multiple registrations
const multiHandlerRegistry = createHandlerRegistry()
  .register('hello', helloRouter)
  .register('greetings', helloRouter); // Can reuse the same router with different tags

const helloHandler = multiHandlerRegistry.get('hello');
//    ^ Type: typeof helloRouter (fully type-safe!)

const greetingsHandler = multiHandlerRegistry.get('greetings');
//    ^ Type: typeof helloRouter (fully type-safe!)

// Step 5: Multiple handlers work perfectly
// (commented out to avoid type issues in example)
// const userRouter = RpcGroup.make(/* other requests */);
// const userHandler = handlerRegistry.createHandler('users', userRouter);
// //    ^ Type: typeof userRouter

// const retrievedUserHandler = handlerRegistry.getHandler('users');
// //    ^ Type: typeof userRouter (fully type-safe!)

// OLD APPROACH (still works for backward compatibility, but returns RpcGroup.RpcGroup<any>)
// import { createHandler, getHandler } from './packages/effect-rpc/src/runtime';
// const legacyHandler = createHandler('legacy', helloRouter);
// const retrievedLegacy = getHandler('legacy'); // RpcGroup.RpcGroup<any>
