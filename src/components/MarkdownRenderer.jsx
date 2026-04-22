import ReactMarkdown from 'react-markdown'

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ inline, children, ...props }) {
          if (inline) {
            return (
              <code className="bg-[#f4f4f4] text-[#0d0d0d] px-1.5 py-0.5 rounded text-xs font-mono border border-[#e5e5e5]" {...props}>
                {children}
              </code>
            )
          }
          return (
            <pre className="bg-[#f4f4f4] rounded-xl p-4 overflow-x-auto my-3 border border-[#e5e5e5]">
              <code className="text-xs font-mono text-[#0d0d0d]" {...props}>
                {children}
              </code>
            </pre>
          )
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-7">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-outside ml-5 mb-3 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-outside ml-5 mb-3 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-7">{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-3 mt-2 text-[#0d0d0d]">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2 mt-2 text-[#0d0d0d]">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-2 mt-1 text-[#0d0d0d]">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-[#d9d9d9] pl-4 text-[#6b6b6b] my-3">
              {children}
            </blockquote>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold text-[#0d0d0d]">{children}</strong>
        },
        hr() {
          return <hr className="border-[#e5e5e5] my-4" />
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
