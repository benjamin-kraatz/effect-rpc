import { Rpc, RpcGroup } from '@effect/rpc';
import { createHandler, createRequests, getHandler } from 'effect-rpc';
import * as S from 'effect/Schema';

class SayHelloFailedError extends S.TaggedError<SayHelloFailedError>('SayHelloFailedError')(
  'SayHelloFailedError',
  {
    module: S.String,
    description: S.String,
  },
) {
  get message(): string {
    return `${this.module}: ${this.description}`;
  }
}
export class SayHelloReq extends S.TaggedRequest<SayHelloReq>('SayHelloReq')('SayHelloReq', {
  payload: { name: S.NonEmptyString },
  success: S.NonEmptyString,
  failure: SayHelloFailedError,
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

export const sayRequests = createRequests('@/hello/SayHelloRequests', { SayHelloReq, SayByeReq });
const helloHandler = createHandler('flamingo', helloRouter);
//    ^ RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
const hellosHandlerFromGet = getHandler('flamingo');
//    ^ ACTUAL: RpcGroup.RpcGroup<any> EXPECTED: RpcGroup.RpcGroup<Rpc.From<typeof SayHelloReq> | Rpc.From<typeof SayByeReq>>
