'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ParsedDocument } from '@/lib/text-parser'
import type { Template } from '@/lib/templates'
import { applyStyle } from '@/lib/styles'

interface DocumentPreviewProps {
  document: ParsedDocument
  template: Template | null
  styleId: string
  colorHeadings: boolean
  onBlockUpdate: (blockId: string, newContent: string) => void
}

export function DocumentPreview({ document, template, styleId, colorHeadings }: DocumentPreviewProps) {
  // Convert parsed blocks back to markdown text
  const markdownText = document.blocks.map(block => {
    switch (block.type) {
      case 'heading1':
        return `# ${block.content}`
      case 'heading2':
        return `## ${block.content}`
      case 'heading3':
        return `### ${block.content}`
      case 'bullet':
        return `- ${block.content}`
      case 'numbered':
        return `1. ${block.content}`
      default:
        return block.content
    }
  }).join('\n\n')
  
  const styledMarkdown = applyStyle(markdownText, styleId)
  
  // Custom components for markdown rendering
  const components = {
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-border px-3 py-2 bg-muted font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-border px-3 py-2" {...props}>
        {children}
      <td>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 className="text-2xl font-bold mb-4" style={colorHeadings ? { color: '#1E3A8A' } : undefined} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-3" style={colorHeadings ? { color: '#2563EB' } : undefined} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-medium mb-2" style={colorHeadings ? { color: '#3B82F6' } : undefined} {...props}>
        {children}
      </h3>
    ),
    ul: ({ children, ...props }: any) => <ul className="list-disc pl-6 my-2 space-y-1" {...props}>{children}</ul>,
    ol: ({ children, ...props }: any) => <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>{children}</ol>,
    li: ({ children, ...props }: any) => <li className="text-sm" {...props}>{children}</li>,
    p: ({ children, ...props }: any) => <p className="text-sm leading-relaxed mb-2" {...props}>{children}</p>,
    strong: ({ children, ...props }: any) => <strong className="font-semibold" {...props}>{children}</strong>,
    em: ({ children, ...props }: any) => <em className="italic" {...props}>{children}</em>,
  }
  
  if (document.blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">Document Preview</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste text above to see a live preview
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">
          {template?.name || 'Document'}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Applying "{styleId}" style
        </p>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto px-6 py-6">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {styledMarkdown}
          </ReactMarkdown>
        </div>
      </div>
      
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          {document.blocks.length} blocks &bull; Ready to export
        </p>
      </div>
    </div>
  )
}