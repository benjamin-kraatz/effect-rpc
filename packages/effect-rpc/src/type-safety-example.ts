/**
 * Example demonstrating both the type-safe registry pattern and the global handler approach
 */
import { Rpc, RpcGroup } from '@effect/rpc';
import * as S from 'effect/Schema';
import { createHandlerRegistry, getHandler, registerHandler } from './registry';

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

const registry = createHandlerRegistry()
  .register('flamingo', helloRouter);

// Full type safety! TypeScript knows exactly what requests are available:
const typeSafeHandler = registry.get('flamingo');
const typeSafeValidRequest = typeSafeHandler.getRequest('SayHelloReq'); // ✓ Type-safe!
// const typeSafeInvalidRequest = typeSafeHandler.getRequest('IDontExist'); // ✗ Type error!

// ===== APPROACH 2: Global registry (legacy support) =====
// This approach provides runtime functionality but limited type safety

const flamingoHandler = registerHandler('flamingo', helloRouter);
const handlerSelf = flamingoHandler.handlers;
const requests = flamingoHandler.getRequests();
const requestNames = requests.map((req) => req.name);
const requestClient = flamingoHandler.getRequest('SayHelloReq');

const r = getHandler("flamingo").getRequest("SayHelloReq") // <- works but limited type safety;
// const r2 = getHandler("flamingo").getRequest("IDontExist") // <- no type error with global approach;

// // NEW APPROACH: Create a type-safe registry (no module augmentation needed!)
// const handlerRegistry = createHandlerRegistry()
//   .register('flamingo', helloRouter)
//   .register('kerze', helloRouter);

// // Step 1: Get handlers with full type safety!
// const retrievedHelloHandler = handlerRegistry.get('flamingo');

// const retrieveCandleHandler = handlerRegistry.get('kerze');
// //    ^ Type: RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
// //           (NOT RpcGroup.RpcGroup<any>!)

// // Step 2: TypeScript will catch typos and invalid tags at compile time
// // const invalidHandler = handlerRegistry.get('typo');
// //       ^ TypeScript Error: Argument of type '"typo"' is not assignable to parameter of type '"flamingo"'

// // Step 3: Check if handler exists with type narrowing
// if (handlerRegistry.has('flamingo')) {
//   const safeHandler = handlerRegistry.get('flamingo');
//   //    ^ Type: RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
// }

// // Step 4: Builder pattern allows chaining multiple registrations
// const multiHandlerRegistry = createHandlerRegistry()
//   .register('hello', helloRouter)
//   .register('greetings', helloRouter); // Can reuse the same router with different tags

// const helloHandler = multiHandlerRegistry.get('hello');
// //    ^ Type: typeof helloRouter (fully type-safe!)

// const greetingsHandler = multiHandlerRegistry.get('greetings');
//    ^ Type: typeof helloRouter (fully type-safe!)

// Step 5: Multiple handlers work perfectly
// (commented out to avoid type issues in example)
// const userRouter = RpcGroup.make(/* other requests */);
// const userHandler = handlerRegistry.register('users', userRouter);
// //    ^ Type: typeof userRouter

// const retrievedUserHandler = handlerRegistry.get('users');
// //    ^ Type: typeof userRouter (fully type-safe!)

// OLD APPROACH (still works for backward compatibility, but returns RpcGroup.RpcGroup<any>)
// import { createHandler, getHandler } from './packages/effect-rpc/src/runtime';
// const legacyHandler = createHandler('legacy', helloRouter);
// const retrievedLegacy = getHandler('legacy'); // RpcGroup.RpcGroup<any>
