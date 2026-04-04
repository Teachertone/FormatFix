'use client'

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
  
  // Simple table renderer
  const renderTable = (tableLines: string[]) => {
    const rows = tableLines.filter(line => line.startsWith('|')).map(line => {
      const cells = line.split('|').filter(cell => {
        const clean = cell.trim()
        return clean !== '' && clean !== '---' && !/^[\-\:]+$/.test(clean)
      })
      return cells
    }).filter(row => row.length > 0)
    
    if (rows.length === 0) return null
    
    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="border border-border px-3 py-2">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  // Parse markdown and render
  const renderContent = () => {
    const lines = styledMarkdown.split('\n')
    const elements: React.ReactNode[] = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i].trim()
      
      // Check for table
      if (line.startsWith('|')) {
        const tableLines: string[] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          tableLines.push(lines[i].trim())
          i++
        }
        const table = renderTable(tableLines)
        if (table) elements.push(table)
        continue
      }
      
      // Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={elements.length} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>)
        i++
        continue
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={elements.length} className="text-xl font-semibold mb-3">{line.slice(3)}</h2>)
        i++
        continue
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={elements.length} className="text-lg font-medium mb-2">{line.slice(4)}</h3>)
        i++
        continue
      }
      
      // Lists
      if (line.startsWith('- ')) {
        elements.push(<li key={elements.length} className="ml-4 list-disc">{line.slice(2)}</li>)
        i++
        continue
      }
      if (line.match(/^\d+\. /)) {
        elements.push(<li key={elements.length} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>)
        i++
        continue
      }
      
      // Empty line
      if (line === '') {
        i++
        continue
      }
      
      // Paragraph
      elements.push(<p key={elements.length} className="text-sm leading-relaxed mb-2">{line}</p>)
      i++
    }
    
    return elements
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
          {renderContent()}
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