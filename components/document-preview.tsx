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

export function DocumentPreview({ document, template, styleId }: DocumentPreviewProps) {
  const renderBlocks = () => {
    const elements: React.ReactNode[] = []
    let numberedCount = 0
    let lastWasNumbered = false
    
    for (const block of document.blocks) {
      const content = applyStyle(block.content, styleId)
      
      switch (block.type) {
        case 'heading1':
          numberedCount = 0
          lastWasNumbered = false
          elements.push(<h1 key={block.id} className="text-2xl font-bold mb-4">{content}</h1>)
          break
          
        case 'heading2':
          numberedCount = 0
          lastWasNumbered = false
          elements.push(<h2 key={block.id} className="text-xl font-semibold mb-3">{content}</h2>)
          break
          
        case 'heading3':
          numberedCount = 0
          lastWasNumbered = false
          elements.push(<h3 key={block.id} className="text-lg font-medium mb-2">{content}</h3>)
          break
          
        case 'bullet':
          lastWasNumbered = false
          elements.push(<p key={block.id} className="text-sm leading-relaxed mb-1">• {content}</p>)
          break
          
        case 'numbered':
          if (!lastWasNumbered) {
            numberedCount = 0
          }
          numberedCount++
          lastWasNumbered = true
          elements.push(<p key={block.id} className="text-sm leading-relaxed mb-1">{numberedCount}. {content}</p>)
          break
          
        default:
          numberedCount = 0
          lastWasNumbered = false
          elements.push(<p key={block.id} className="text-sm leading-relaxed mb-2">{content}</p>)
      }
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
        <div className="prose prose-sm max-w-none">{renderBlocks()}</div>
      </div>
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">{document.blocks.length} blocks &bull; Ready to export</p>
      </div>
    </div>
  )
}