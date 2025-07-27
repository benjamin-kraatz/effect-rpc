# effect-rpc

## 0.8.0

### Minor Changes

- [#7](https://github.com/benjamin-kraatz/effect-rpc/pull/7) [`dd520a0`](https://github.com/benjamin-kraatz/effect-rpc/commit/dd520a072935b5145d2af5da7290c78daa2b5ae7) Thanks @benjamin-kraatz! - The new registry-approach allows to define the RPC group once, and use it everywhere, e.g. in Route Handler, on the client and more - this is basically similar to the "legacy" approach, but allows for more purpose/entity/group-bound access. This makes the code more expressive and clear, and way more typesafe.

  We've deprecated some functions and features that are not useful and not required to be included. They will be removed in future versions.

## 0.7.0

### Minor Changes

- [`92565f3`](https://github.com/benjamin-kraatz/effect-rpc/commit/92565f39dc2c2e6562949bd1420cde5b773543ae) Thanks @benjamin-kraatz! - Add `createRuntime` to more easily create a `ManagedRuntime`. This makes the process less verbose while still allowing for flexibility.
