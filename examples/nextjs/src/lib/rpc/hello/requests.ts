import { Rpc, RpcGroup } from '@effect/rpc';
import { createHandler, createRequests, createRpcGroupRegistry, getHandler } from 'effect-rpc';
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
class SayHelloReq extends S.TaggedRequest<SayHelloReq>('SayHelloReq')('SayHelloReq', {
  payload: { name: S.NonEmptyString },
  success: S.NonEmptyString,
  failure: SayHelloFailedError,
}) {}

class SayByeReq extends S.TaggedRequest<SayByeReq>('SayByeReq')('SayByeReq', {
  payload: { name: S.NonEmptyString },
  success: S.NonEmptyString,
  failure: S.Never,
}) {}

export const helloRouter = RpcGroup.make(
  Rpc.fromTaggedRequest(SayHelloReq),
  Rpc.fromTaggedRequest(SayByeReq),
);

export const helloRequests = createRpcGroupRegistry().registerGetGroup('hello', helloRouter);
