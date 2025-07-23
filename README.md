# Effect RPC (Experimental)

> **Alpha**: This package is experimental and under active development. APIs may change at any time. Feedback and contributions are welcome!

![NPM Version](https://img.shields.io/npm/v/effect-rpc)

[typedoc documentation](https://effect-rpc-docs.fly.dev/)

Effect RPC provides a type-safe, robust, and ergonomic way to call backend functions from your frontend—without ever writing `fetch` or worrying about error handling, dependency management, or response parsing. It is powered by [Effect](https://effect.website), enabling seamless full-stack development with strong type inference and composable effects.

## Features

- **End-to-end type safety**: Types flow from backend to frontend, ensuring you never mismatch data or miss errors.
- **No fetch required**: Abstracts away HTTP, serialization, and network details.
- **Automatic error handling**: Errors are handled in a consistent, effectful way—no more try/catch everywhere.
- **Composable**: Built on Effect, so you can compose, layer, and manage dependencies naturally.
- **Framework-agnostic**: Designed for modern full-stack frameworks (Next.js, etc.), but not tied to any specific one.
- **Batteries included**: Use predefined hooks, services, properties and caller functions to reduce boilerplate

## Installation

```bash
npm install effect-rpc
# or
pnpm add effect-rpc
# or
yarn add effect-rpc
```

## Quick Example

### 1. Define the requests and router

```ts
// src/lib/rpc/service.ts
import * as S from "effect/Schema";

export class SayHelloFailedError extends S.TaggedError<SayHelloFailedError>("SayHelloFailedError", {
    message: S.String,
});

export class SayHelloReq extends S.TaggedRequest<SayHelloReq>("SayHelloReq")(
  "SayHelloReq",
  {
    payload: { name: S.NonEmptyString },
    success: S.NonEmptyString,
    failure: SayHelloFailedError,
  }
) {}

// ... and other requests

export const helloRouter = RpcGroup.make(
  Rpc.fromTaggedRequest(SayHelloReq),
  Rpc.fromTaggedRequest(SayByeReq)
  Rpc.fromTaggedRequest(PingPongReq).middleware(AuthMiddleware),
); // or .middleware(AuthMiddleware) here to add it to all. Just @effect/rpc
```

### 2. Define the implementation

```ts
// src/lib/rpc/hello.ts
import * as Effect from "effect/Effect";

export class HelloService extends Effect.Service<HelloService>()(
  "HelloService",
  {
    accessors: true,
    succeed: {
      sayHello: (name: string) => Effect.succeed(`Hello ${name}`),
      sayBye: (name: string) => Effect.succeed(`Bye ${name}`),
      pingPong: (ping: string) => Effect.succeed("Pong"),
    },
  }
) {}
```

### 3. Create a runtime for the client

```ts
// src/lib/runtiem.ts
import { makeRPCBackendLayer } from "effect-rpc";

export const AppRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    makeRPCBackendLayer({ url: "http://localhost:3000/api/hello" })
    // AuthClientLive // if there's an auth middleware, for example
  )
);
```

### 3. Expose the router via an API route (Next.js example)

```typescript
// src/app/api/rpc/route.ts
import { createRPCHandler } from "effect-rpc";
import { HelloService } from "@/lib/rpc/hello";
import { helloRouter } from "@/lib/rpc/service";

const handler = createRPCHandler(
  router,
  {
    SayByeReq: ({ name }) => HelloService.sayBye(name),
    SayHelloReq: ({ name }) => HelloService.sayHello(name),
    PingPongReq: (req) => HelloService.pingPong(req),
  },
  HelloService.Default
);

export const POST = async (request: Request) => {
  try {
    return await handler(request);
  } catch (error) {
    console.error("Error in hello API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
```

### 4. Call backend functions from the frontend

#### 4.1 Using a hook in a client component

```jsx
// src/app/page.tsx
"use client";

import { useRPCRequest } from "effect-rpc/client";
import { helloRouter } from "@/lib/rpc/service";
import { AppRuntime } from "@/lib/runtime";

export function GreetUserButton() {
  const sayHello = useRPCRequest(helloRouter, "SayHelloReq");

  const greet = async () => {
    const greetPhrase = await sayHello({ name: "Ben" }).pipe(
      Effect.catchTag("SayHelloFailedError", (error) => {
        toast.error("An error occured", { description: error.message });
      }).pipe(AppRuntime.runPromise)
    );

    toast.info(greetPhrase);
  };

  return <button onClick={greet}>Greet me!</button>;
}
```

#### 4.2 In server actions

```jsx
// src/lib/actions.ts
"use server";

import { makeServerRequest } from "effect-rpc";
import { helloRouter } from "@/lib/rpc/service";
import { AppRuntime } from "@/lib/runtime";

export async function greetUser(): Promise<string> {
  const request = makeServerRequest(helloRouter, "SayHelloReq");
  return AppRuntime.runPromise(request({ name }));
}
```

## Example applications

- [Next.js](./examples/nextjs)
- [TanStack Start](./examples/tanstack-start/) (⚠️ Not fully complete yet)

## Why Effect RPC?

- **No more fetch boilerplate**: Just call your backend functions as if they were local.
- **Unified error handling**: All errors are managed through Effect, so you can compose, catch, and recover as needed.
- **Type-safe contracts**: Your API surface is always in sync between client and server.
- **Composable and testable**: Use Effect's powerful features for dependency injection, testing, and more.
- **Batteries included**: Use predefined hooks, services, properties and caller functions to reduce boilerplate

## Status & Roadmap

- **Alpha**: APIs are not stable. Expect breaking changes.
- **Planned**: More adapters (Express, Vercel, etc.), middleware support, advanced error mapping, and more.

## Limitations

- Only supports JSON-serializable data for now.
- Not production-ready—use for experimentation and feedback.

## Contributing

Contributions, issues, and feedback are welcome! Please open an issue or PR if you have suggestions or find bugs.

---

Made with ❤️ using [Effect](https://effect.website).
