import ReactMarkdown from 'react-markdown'

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      components={{
        code({ inline, children, ...props }) {
          if (inline) {
            return (
              <code
                className="bg-[#f4f4f4] dark:bg-[#1a1a1a] text-[#c7254e] dark:text-[#f87171] px-1.5 py-0.5 rounded text-[15px] font-mono border border-[#e5e5e5] dark:border-[#333]"
                {...props}
              >
                {children}
              </code>
            )
          }
          return (
            <pre className="bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-xl p-5 overflow-x-auto my-4 border border-[#e5e5e5] dark:border-[#2f2f2f]">
              <code className="text-[14px] font-mono text-[#1a1a1a] dark:text-[#d1d1d1] leading-relaxed" {...props}>
                {children}
              </code>
            </pre>
          )
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0 text-[17px] leading-[1.8] text-[#1a1a1a] dark:text-[#d1d1d1]">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-outside ml-6 mb-4 space-y-2">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">{children}</ol>
        },
        li({ children }) {
          return <li className="text-[17px] leading-[1.8] text-[#1a1a1a] dark:text-[#d1d1d1]">{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-2xl font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-4 mt-6 leading-snug">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-3 mt-5 leading-snug">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececec] mb-2 mt-4 leading-snug">{children}</h3>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-[#d9d9d9] dark:border-[#444] pl-5 text-[#555] dark:text-[#888] my-4 text-[17px] leading-[1.8] italic">
              {children}
            </blockquote>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold text-[#0d0d0d] dark:text-[#ececec]">{children}</strong>
        },
        hr() {
          return <hr className="border-[#e5e5e5] dark:border-[#2f2f2f] my-6" />
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-[16px] border-collapse border border-[#e5e5e5] dark:border-[#2f2f2f] rounded-lg">
                {children}
              </table>
            </div>
          )
        },
        th({ children }) {
          return <th className="bg-[#f7f7f8] dark:bg-[#1a1a1a] px-4 py-3 text-left font-semibold text-[#0d0d0d] dark:text-[#ececec] border border-[#e5e5e5] dark:border-[#2f2f2f]">{children}</th>
        },
        td({ children }) {
          return <td className="px-4 py-3 text-[#1a1a1a] dark:text-[#d1d1d1] border border-[#e5e5e5] dark:border-[#2f2f2f]">{children}</td>
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
