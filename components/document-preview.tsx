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
  const renderFormattedText = (text: string) => {
    // Simple formatting for now
    return text
  }
  
  const renderBlocks = () => {
    const elements: React.ReactNode[] = []
    let currentList: { type: 'bullet' | 'numbered'; items: string[] } | null = null
    
    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'bullet') {
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-sm">{renderFormattedText(applyStyle(item, styleId))}</li>
              ))}
            </ul>
          )
        } else {
          elements.push(
            <ol key={`list-${elements.length}`} className="list-decimal pl-6 my-2 space-y-1">
              {currentList.items.map((item, i) => (
                <li key={i} className="text-sm">{renderFormattedText(applyStyle(item, styleId))}</li>
              ))}
            </ol>
          )
        }
        currentList = null
      }
    }
    
    for (const block of document.blocks) {
      const content = applyStyle(block.content, styleId)
      
      if (block.type === 'bullet') {
        if (!currentList || currentList.type !== 'bullet') {
          flushList()
          currentList = { type: 'bullet', items: [content] }
        } else {
          currentList.items.push(content)
        }
      } else if (block.type === 'numbered') {
        if (!currentList || currentList.type !== 'numbered') {
          flushList()
          currentList = { type: 'numbered', items: [content] }
        } else {
          currentList.items.push(content)
        }
      } else {
        flushList()
        if (block.type === 'heading1') {
          elements.push(<h1 key={block.id} className="text-2xl font-bold mb-4">{content}</h1>)
        } else if (block.type === 'heading2') {
          elements.push(<h2 key={block.id} className="text-xl font-semibold mb-3">{content}</h2>)
        } else if (block.type === 'heading3') {
          elements.push(<h3 key={block.id} className="text-lg font-medium mb-2">{content}</h3>)
        } else {
          elements.push(<p key={block.id} className="text-sm leading-relaxed mb-2">{content}</p>)
        }
      }
    }
    flushList()
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
        <div className="prose prose-sm max-w-none">{renderBlocks()}</div>
      </div>
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">{document.blocks.length} blocks &bull; Ready to export</p>
      </div>
    </div>
  )
}