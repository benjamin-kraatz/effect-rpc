import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function CodeBlock({
  className,
  children,
  language,
}: {
  className?: string;
  children: React.ReactNode;
  language?: string;
}) {
  const match = /language-(\w+)/.exec(className || "");
  const lang = language || match?.[1];

  return lang ? (
    <div className="my-8 rounded-lg overflow-hidden border border-gray-700 shadow-2xl max-w-4xl">
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={lang}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "16px",
          lineHeight: "1.3",
          padding: "2rem",
          background: "rgb(15, 23, 42)",
        }}
      >
        {/* {String(children).replace(/\n$/, "")} */}
        {String(JSON.parse(JSON.stringify(children))).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className="bg-gray-800 text-green-300 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  );
}
