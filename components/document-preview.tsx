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
  const markdownText = document.blocks.map(block => {
    switch (block.type) {
      case 'heading1': return `# ${block.content}`
      case 'heading2': return `## ${block.content}`
      case 'heading3': return `### ${block.content}`
      case 'bullet': return `- ${block.content}`
      case 'numbered': return `1. ${block.content}`
      default: return block.content
    }
  }).join('\n\n')
  
  const styledMarkdown = applyStyle(markdownText, styleId)
  
  const renderContent = () => {
    const lines = styledMarkdown.split('\n')
    const elements: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []
    let listItems: React.ReactNode[] = []
    let listType: 'bullet' | 'numbered' | null = null
    
    const flushList = () => {
      if (listItems.length > 0) {
        const ListTag = listType === 'bullet' ? 'ul' : 'ol'
        elements.push(
          React.createElement(ListTag, { key: `list-${elements.length}`, className: "my-2 space-y-1" }, listItems)
        )
        listItems = []
        listType = null
      }
    }
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check for table
      if (line.startsWith('|') && line.endsWith('|')) {
        flushList()
        const cells = line.split('|').filter(cell => {
          const clean = cell.trim()
          return clean !== '' && clean !== '---'
        })
        if (cells.length > 0) {
          if (!inTable) {
            inTable = true
            tableRows = []
          }
          tableRows.push(cells)
        }
        continue
      }
      
      // If we were in a table, render it now
      if (inTable && tableRows.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-border">
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, jdx) => (
                      <td key={jdx} className="border border-border px-3 py-2">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        inTable = false
        tableRows = []
      }
      
      // Check for bullet points
      if (line.startsWith('- ')) {
        flushList()
        listType = 'bullet'
        listItems.push(<li key={listItems.length} className="ml-4 list-disc text-sm">{line.slice(2)}</li>)
        continue
      }
      
      // Check for numbered lists
      const numberedMatch = line.match(/^\d+\. /)
      if (numberedMatch) {
        flushList()
        listType = 'numbered'
        listItems.push(<li key={listItems.length} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\. /, '')}</li>)
        continue
      }
      
      // Not a list item, flush any pending list
      flushList()
      
      // Headings
      if (line.startsWith('# ')) {
        elements.push(<h1 key={elements.length} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={elements.length} className="text-xl font-semibold mb-3">{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={elements.length} className="text-lg font-medium mb-2">{line.slice(4)}</h3>)
      } else if (line) {
        elements.push(<p key={elements.length} className="text-sm leading-relaxed mb-2">{line}</p>)
      }
    }
    
    // Flush any remaining list
    flushList()
    
    // Flush any remaining table
    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-border">
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, jdx) => (
                    <td key={jdx} className="border border-border px-3 py-2">
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
          <p className="mt-1 text-xs text-muted-foreground">Paste text above to see a live preview</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">{template?.name || 'Document'}</h1>
        <p className="mt-1 text-xs text-muted-foreground">Applying "{styleId}" style</p>
      </div>
      <div className="max-h-[500px] overflow-y-auto px-6 py-6">
        <div className="prose prose-sm max-w-none">{renderContent()}</div>
      </div>
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">{document.blocks.length} blocks &bull; Ready to export</p>
      </div>
    </div>
  )
} 