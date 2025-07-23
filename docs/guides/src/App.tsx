import * as React from "react";
import * as Guides from "./guides/_all.mdx";
import { MDXProvider } from "@mdx-js/react";
import { CodeBlock } from "./components/CodeBlock";

const guides = Object.entries(Guides);

const components = {
  CodeBlock: CodeBlock,
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="text-5xl font-bold mb-16 mt-8 text-white border-b-2 border-blue-500 pb-8 leading-tight"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-3xl font-semibold mt-24 mb-12 text-blue-400 leading-snug"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-2xl font-medium mt-20 mb-10 text-green-400 leading-snug"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-gray-300 leading-loose mb-12 text-lg font-light tracking-wide max-w-4xl"
      {...props}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 bg-slate-800/50 p-12 my-16 rounded-r-xl backdrop-blur-sm max-w-4xl"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => {
    console.log("UL component rendered with props:", props);
    return (
      <ul
        className="!space-y-6 !mb-16 !text-gray-300 !pl-6 !max-w-4xl !list-none"
        style={{
          listStyle: "none",
          paddingLeft: "1.5rem",
          marginBottom: "4rem",
          color: "rgb(209 213 219)",
          maxWidth: "56rem",
        }}
        {...props}
      />
    );
  },
  li: (props: React.HTMLAttributes<HTMLLIElement>) => {
    console.log("LI component rendered with props:", props);
    return (
      <li
        className="!flex !items-start !leading-loose !text-lg !relative !my-6"
        style={{
          display: "flex",
          alignItems: "flex-start",
          fontSize: "1.125rem",
          lineHeight: "2",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          paddingLeft: "2rem",
          position: "relative",
        }}
        {...props}
      />
    );
  },
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-yellow-400 font-semibold" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-slate-800 text-emerald-300 px-3 py-2 mx-1 rounded-md text-base font-mono border border-slate-700"
      {...props}
    />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-slate-600 my-20" {...props} />
  ),
};

export default function App() {
  const [activeGuide, setActiveGuide] = React.useState(guides[0]![0]);

  const GuideComponent = guides.find(
    ([name]) => name === activeGuide
  )?.[1] as any;
  const Guide = GuideComponent?.default ?? (() => null);

  return (
    <MDXProvider components={components}>
      <div className="bg-gray-50 font-sans antialiased text-gray-900">
        <div className="flex min-h-screen">
          <div className="w-72 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-8 border-r border-gray-700">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">RPC-Less</h1>
            <p className="text-gray-400 text-sm mb-8">Documentation & Guides</p>
            <nav className="mt-8">
              <ul className="space-y-2">
                {guides.map(([name]) => (
                  <li key={name}>
                    <a
                      href="#"
                      className={`block py-3 px-4 rounded-lg transition-all duration-200 text-sm font-medium ${
                        activeGuide === name
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveGuide(name);
                      }}
                    >
                      {name.replace(/([A-Z])/g, " $1").trim()}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <main className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-y-auto">
            <div className="max-w-6xl mx-auto px-16 py-24">
              <div className="max-w-none mdx-content">
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                    .mdx-content ul {
                      list-style: none !important;
                      padding-left: 1.5rem !important;
                      margin-bottom: 2rem !important;
                      color: rgb(209 213 219) !important;
                      max-width: 56rem !important;
                    }
                    .mdx-content li {
                      font-size: 1.125rem !important;
                      line-height: 1.35 !important;
                      letter-spacing: 0.025em !important;
                      margin-top: 1.1rem !important;
                      margin-bottom: 1.1rem !important;
                      position: relative !important;
                      padding-left: 2rem !important;
                    }
                    .mdx-content li::before {
                      content: '▸' !important;
                      color: rgb(96 165 250) !important;
                      margin-right: 0.75rem !important;
                      font-size: 1.25rem !important;
                      flex-shrink: 0 !important;
                      position: absolute !important;
                      left: 0 !important;
                    }
                    .mdx-content p {
                      color: rgb(209 213 219) !important;
                      line-height: 1.3 !important;
                      margin-bottom: 3rem !important;
                      font-size: 1.125rem !important;
                      font-weight: 400 !important;
                      letter-spacing: 0.025em !important;
                      max-width: 56rem !important;
                    }
                    .mdx-content h2 {
                      font-size: 1.875rem !important;
                      font-weight: 600 !important;
                      margin-top: 4rem !important;
                      margin-bottom: 3rem !important;
                      color: rgb(96 165 250) !important;
                      line-height: 1.375 !important;
                    }
                    .mdx-content h3 {
                      font-size: 1.5rem !important;
                      font-weight: 500 !important;
                      margin-top: 3rem !important;
                      margin-bottom: 1.25rem !important;
                      color: rgb(36 148 194) !important;
                      line-height: 1.375 !important;
                    }
                  `,
                  }}
                />
                <Guide />
              </div>
            </div>
          </main>
        </div>
      </div>
    </MDXProvider>
  );
}
