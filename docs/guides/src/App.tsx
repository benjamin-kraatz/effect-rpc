import * as React from 'react'
import * as Guides from './guides/_all'
import { MDXProvider } from '@mdx-js/react'
import { CodeBlock } from './components/CodeBlock'

const guides = Object.entries(Guides)

const components = {
  code: CodeBlock,
}

export default function App() {
  const [activeGuide, setActiveGuide] = React.useState(guides[0]![0])

  const Guide =
    guides.find(([name]) => name === activeGuide)?.[1]?.default ?? (() => null)

  return (
    <MDXProvider components={components}>
      <div className="bg-gray-50 font-sans antialiased text-gray-900">
        <div className="flex min-h-screen">
          <div className="w-64 bg-gray-800 text-white p-8">
            <h1 className="text-2xl font-bold">RPC-Less</h1>
            <nav className="mt-8">
              <ul>
                {guides.map(([name]) => (
                  <li key={name} className="mt-4">
                    <a
                      href="#"
                      className={`block py-2 px-4 rounded-lg transition-colors duration-200 ${
                        activeGuide === name
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveGuide(name)
                      }}
                    >
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <main className="flex-1 p-8">
            <div className="prose prose-lg max-w-none">
              <Guide />
            </div>
          </main>
        </div>
      </div>
    </MDXProvider>
  )
}
