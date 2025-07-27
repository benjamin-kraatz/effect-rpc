---
'effect-rpc': minor
---

The new registry-approach allows to define the RPC group once, and use it everywhere, e.g. in Route Handler, on the client and more - this is basically similar to the "legacy" approach, but allows for more purpose/entity/group-bound access. This makes the code more expressive and clear, and way more typesafe.

We've deprecated some functions and features that are not useful and not required to be included. They will be removed in future versions.