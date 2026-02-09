"use client";

import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PolicyViewerProps {
  content: string;
}

export function PolicyViewer({ content }: PolicyViewerProps) {
  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-8">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold tracking-tight border-b pb-4 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mt-10 mb-4 text-primary">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-medium mt-4 mb-2">{children}</h4>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-7">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 list-disc pl-6 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 list-decimal pl-6 space-y-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-7">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="my-6 w-full overflow-x-auto">
                  <table className="w-full border-collapse border border-border rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="border border-border px-4 py-2 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2">{children}</td>
              ),
              hr: () => <hr className="my-8 border-border" />,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                  {children}
                </pre>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </div>
    </ScrollArea>
  );
}
