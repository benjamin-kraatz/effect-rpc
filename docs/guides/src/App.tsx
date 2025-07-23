import { MDXProvider } from "@mdx-js/react";
import Content from "./content.mdx";

function App() {
  return (
    <MDXProvider>
      <div className="App">
        <h1>MDX Demo</h1>
        <Content />
      </div>
    </MDXProvider>
  );
}

export default App;
