import { useRPCRequest } from "effect-rpc";
import { helloRouter } from "~/lib/rpc/hello/requests";
import { AppRuntime } from "~/lib/runtime";

export function ByeButton() {
  const sayBye = useRPCRequest(helloRouter, "SayByeReq");

  const bye = async () => {
    const byePhraseProgram = sayBye({ name: "World" });
    byePhraseProgram;
    const byePhrase = await AppRuntime.runPromise(byePhraseProgram);
    alert(byePhrase);
  };

  return (
    <button
      onClick={bye}
      className="border px-3 py-1.5 rounded-lg hover:bg-slate-800"
    >
      Say bye!
    </button>
  );
}
