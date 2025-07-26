import { Rpc, RpcGroup } from "@effect/rpc";
import { createRequests } from "effect-rpc";
import * as S from "effect/Schema";

class SayHelloFailedError extends S.TaggedError<SayHelloFailedError>(
  "SayHelloFailedError"
)("SayHelloFailedError", {
  module: S.String,
  description: S.String,
}) {
  get message(): string {
    return `${this.module}: ${this.description}`;
  }
}
export class SayHelloReq extends S.TaggedRequest<SayHelloReq>("SayHelloReq")(
  "SayHelloReq",
  {
    payload: { name: S.NonEmptyString },
    success: S.NonEmptyString,
    failure: SayHelloFailedError,
  }
) {}

export class SayByeReq extends S.TaggedRequest<SayByeReq>("SayByeReq")(
  "SayByeReq",
  {
    payload: { name: S.NonEmptyString },
    success: S.NonEmptyString,
    failure: S.Never,
  }
) {}

export const helloRouter = RpcGroup.make(
  Rpc.fromTaggedRequest(SayHelloReq),
  Rpc.fromTaggedRequest(SayByeReq)
);

const sayRequests = createRequests("SayHelloRequests", [
  SayHelloReq,
  SayByeReq,
]);
