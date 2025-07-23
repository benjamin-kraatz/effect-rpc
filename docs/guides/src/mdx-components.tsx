import type { MDXComponents } from "mdx/types";
import Image, { ImageProps } from "next/image";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-8 mt-4 text-foreground border-b-1 border-primary pb-4 leading-tight">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mb-4 mt-8 text-foreground leading-tight">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-bold mb-4 mt-8 text-foreground leading-tight">
        {children}
      </h3>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
        {...(props as ImageProps)}
      />
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 my-4 text-foreground">{children}</ul>
    ),
    li: ({ children }) => (
      <li className="my-2 leading-relaxed text-foreground">{children}</li>
    ),
    p: ({ children }) => (
      <p className="my-4 leading-relaxed text-foreground">{children}</p>
    ),
    code: ({ children }) => (
      <code className="bg-secondary rounded px-1 py-0.5 text-sm font-mono text-foreground">
        {children}
      </code>
    ),
    ...components,
  };
}
