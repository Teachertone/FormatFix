'use client'

import { useCallback, useState } from 'react'
import type { ParsedDocument } from '@/lib/text-parser'
import type { Template } from '@/lib/templates'
import { applyStyle } from '@/lib/styles'
import { cn } from '@/lib/utils'

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
  
  // Improved table parser
  function renderMarkdown(content: string) {
    const lines = content.split('\n')
    const result: React.ReactNode[] = []
    let inTable = false
    let tableRows: string[][] = []
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check if line is a table row (starts and ends with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed.split('|').filter(cell => {
          const clean = cell.trim()
          // Skip empty cells and separator rows (contain only dashes)
          return clean !== '' && !/^\-+$/.test(clean)
        })
        
        if (cells.length > 0) {
          if (!inTable) {
            inTable = true
            tableRows = []
          }
          tableRows.push(cells)
        }
      } else {
        if (inTable && tableRows.length > 0) {
          // Render the table
          result.push(
            <div key={`table-${result.length}`} className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className="border border-border px-3 py-2">
                          {cell.trim()}
                        </td>
                      ))}
                    </table>
                  ))}
                </tbody>
              </table>
            </div>
          )
          inTable = false
          tableRows = []
        }
        
        // Render non-table content
        if (trimmed.startsWith('# ')) {
          result.push(<h1 key={result.length} className="text-2xl font-bold mb-4">{trimmed.slice(2)}</h1>)
        } else if (trimmed.startsWith('## ')) {
          result.push(<h2 key={result.length} className="text-xl font-semibold mb-3">{trimmed.slice(3)}</h2>)
        } else if (trimmed.startsWith('### ')) {
          result.push(<h3 key={result.length} className="text-lg font-medium mb-2">{trimmed.slice(4)}</h3>)
        } else if (trimmed.startsWith('- ')) {
          result.push(<li key={result.length} className="ml-4 list-disc">{trimmed.slice(2)}</li>)
        } else if (trimmed.match(/^\d+\. /)) {
          result.push(<li key={result.length} className="ml-4 list-decimal">{trimmed.replace(/^\d+\. /, '')}</li>)
        } else if (trimmed) {
          result.push(<p key={result.length} className="text-sm leading-relaxed mb-2">{trimmed}</p>)
        } else {
          result.push(<br key={result.length} />)
        }
      }
    }
    
    if (inTable && tableRows.length > 0) {
      result.push(
        <div key={`table-${result.length}`} className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-border">
            <tbody>
              {tableRows.map((row, i) => (
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
    
    return result
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
          {renderMarkdown(styledMarkdown)}
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