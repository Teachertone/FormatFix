'use client'

import { useState, useCallback } from 'react'
import { parseInlineFormatting, type ParsedBlock, type ParsedDocument } from '@/lib/text-parser'
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

export function DocumentPreview({ document, template, styleId, colorHeadings, onBlockUpdate }: DocumentPreviewProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  
  const handleBlockClick = useCallback((block: ParsedBlock) => {
    setEditingBlockId(block.id)
    setEditValue(block.content)
  }, [])
  
  const handleBlur = useCallback(() => {
    if (editingBlockId) {
      onBlockUpdate(editingBlockId, editValue)
      setEditingBlockId(null)
    }
  }, [editingBlockId, editValue, onBlockUpdate])
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setEditingBlockId(null)
    }
  }, [handleBlur])
  
  // Render text with inline formatting
  const renderFormattedText = (text: string) => {
  console.log("[v0] renderFormattedText input:", text)
  const segments = parseInlineFormatting(text)
  console.log("[v0] renderFormattedText segments:", segments)
    return segments.map((segment, i) => {
      if (segment.bold && segment.italic) {
        return <strong key={i}><em>{segment.text}</em></strong>
      }
      if (segment.bold) {
        return <strong key={i}>{segment.text}</strong>
      }
      if (segment.italic) {
        return <em key={i}>{segment.text}</em>
      }
      return <span key={i}>{segment.text}</span>
    })
  }
  
  const renderBlock = (block: ParsedBlock, index: number) => {
    console.log("[v0] Before applyStyle:", block.content)
    const styledContent = applyStyle(block.content, styleId)
    console.log("[v0] After applyStyle:", styledContent)
    
    const isEditing = editingBlockId === block.id
    
    const baseClasses = "cursor-pointer rounded-sm px-2 py-1 -mx-2 transition-colors hover:bg-muted/50"
    const editingClasses = "ring-2 ring-accent ring-offset-2 ring-offset-card"
    
    if (isEditing) {
      return (
        <div key={block.id} className={cn(baseClasses, editingClasses)}>
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn(
              "w-full resize-none bg-transparent outline-none",
              block.type === 'heading1' && "text-xl font-bold",
              block.type === 'heading2' && "text-lg font-semibold",
              block.type === 'heading3' && "text-base font-semibold",
              block.type === 'paragraph' && "text-sm leading-relaxed",
              block.type === 'bullet' && "text-sm",
              block.type === 'numbered' && "text-sm"
            )}
            rows={Math.max(1, Math.ceil(editValue.length / 60))}
          />
        </div>
      )
    }
    
    switch (block.type) {
      case 'heading1':
        return (
          <h2
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "text-xl font-bold",
              block.emphasis === 'italic' && "italic"
            )}
            style={colorHeadings ? { color: '#1E3A8A' } : undefined}
          >
            {renderFormattedText(styledContent)}
          </h2>
        )
        
      case 'heading2':
        return (
          <h3
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "text-lg font-semibold",
              block.emphasis === 'italic' && "italic"
            )}
            style={colorHeadings ? { color: '#2563EB' } : undefined}
          >
            {renderFormattedText(styledContent)}
          </h3>
        )
        
      case 'heading3':
        return (
          <h4
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "text-base font-semibold",
              block.emphasis === 'italic' && "italic"
            )}
            style={colorHeadings ? { color: '#3B82F6' } : undefined}
          >
            {renderFormattedText(styledContent)}
          </h4>
        )
        
      case 'bullet':
        return (
          <li
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "ml-4 list-disc text-sm text-foreground",
              block.emphasis === 'bold' && "font-semibold",
              block.emphasis === 'italic' && "italic"
            )}
          >
            {renderFormattedText(styledContent)}
          </li>
        )
        
      case 'numbered':
        return (
          <li
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "ml-4 list-decimal text-sm text-foreground",
              block.emphasis === 'bold' && "font-semibold",
              block.emphasis === 'italic' && "italic"
            )}
          >
            {renderFormattedText(styledContent)}
          </li>
        )
        
      default:
        return (
          <p
            key={block.id}
            onClick={() => handleBlockClick(block)}
            className={cn(
              baseClasses,
              "text-sm leading-relaxed text-foreground",
              block.emphasis === 'bold' && "font-semibold",
              block.emphasis === 'italic' && "italic"
            )}
          >
            {renderFormattedText(styledContent)}
          </p>
        )
    }
  }
  
  // Group blocks for list rendering
const renderBlocks = () => {
  const elements: React.ReactNode[] = []
  let currentList: { type: 'bullet' | 'numbered'; blocks: ParsedBlock[] } | null = null
  
  // Original log
  console.log("[v0] Rendering blocks:", document.blocks.map(b => ({ type: b.type, content: b.content.substring(0, 30) })))
  
  // New logs
  console.log("[v0] renderBlocks - document.blocks:", document.blocks.map(b => ({ 
    type: b.type, 
    content: b.content.substring(0, 30) 
  })))
  
    document.blocks.forEach((block, index) => {
    console.log("[v0] Processing block:", block.type, block.content.substring(0, 30))

      if (block.type === 'bullet' || block.type === 'numbered') {
        if (currentList && currentList.type === block.type) {
          currentList.blocks.push(block)
        } else {
          if (currentList) {
            const ListTag = currentList.type === 'bullet' ? 'ul' : 'ol'
            elements.push(
              <ListTag key={`list-${elements.length}`} className="my-2 space-y-1">
                {currentList.blocks.map((b, i) => renderBlock(b, i))}
              </ListTag>
            )
          }
          currentList = { type: block.type, blocks: [block] }
        }
      } else {
        if (currentList) {
          const ListTag = currentList.type === 'bullet' ? 'ul' : 'ol'
          elements.push(
            <ListTag key={`list-${elements.length}`} className="my-2 space-y-1">
              {currentList.blocks.map((b, i) => renderBlock(b, i))}
            </ListTag>
          )
          currentList = null
        }
        elements.push(
          <div key={block.id} className="my-3">
            {renderBlock(block, index)}
          </div>
        )
      }
    })
    
    // Flush remaining list
    if (currentList) {
      const ListTag = currentList.type === 'bullet' ? 'ul' : 'ol'
      elements.push(
        <ListTag key={`list-${elements.length}`} className="my-2 space-y-1">
          {currentList.blocks.map((b, i) => renderBlock(b, i))}
        </ListTag>
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
          <p className="mt-1 text-xs text-muted-foreground">
            Paste text above to see a live preview
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      {/* Document header */}
      <div className="border-b border-border bg-muted/30 px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">
          {template?.name || 'Document'}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Click any text to edit directly
        </p>
      </div>
      
      {/* Document content */}
      <div className="max-h-[500px] overflow-y-auto px-6 py-6">
        <div className="prose prose-sm max-w-none">
          {renderBlocks()}
        </div>
      </div>
      
      {/* Document footer */}
      <div className="border-t border-border bg-muted/30 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          {document.blocks.length} blocks &bull; Ready to export
        </p>
      </div>
    </div>
  )
}
