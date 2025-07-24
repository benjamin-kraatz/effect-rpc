import * as Effect from "effect/Effect";

export class HelloService extends Effect.Service<HelloService>()(
  "HelloService",
  {
    accessors: true,
    succeed: {
      sayHello: (name: string) =>
        Effect.succeed(`Hello from the backend, ${name}`),
      sayBye: (name: string) => Effect.succeed(`Bye from the backend, ${name}`),
    },
  }
) {}
