'use client'

import { useCallback, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Upload, Sparkles } from 'lucide-react'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onLoadExample: () => void
}

// Helper function to preserve markdown tables from plain text
function preserveMarkdownTables(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inTable = false
  let tableLines: string[] = []
  
  for (const line of lines) {
    // Check if line looks like a markdown table row (contains | and multiple columns)
    const pipeCount = (line.match(/\|/g) || []).length
    const isTableRow = pipeCount >= 2
    
    if (isTableRow) {
      if (!inTable) {
        inTable = true
        tableLines = []
      }
      tableLines.push(line)
    } else {
      if (inTable) {
        // Flush the table
        result.push(...tableLines)
        inTable = false
        tableLines = []
      }
      result.push(line)
    }
  }
  
  if (inTable) {
    result.push(...tableLines)
  }
  
  return result.join('\n')
}

// Helper function to convert HTML tables to markdown
function convertHtmlTablesToMarkdown(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const tables = doc.querySelectorAll('table')
  
  if (tables.length === 0) return ''
  
  let result = ''
  tables.forEach(table => {
    const rows: string[] = []
    const trs = table.querySelectorAll('tr')
    trs.forEach((tr, i) => {
      const cells = tr.querySelectorAll('th, td')
      const rowCells = Array.from(cells).map(cell => cell.textContent?.trim() || '')
      rows.push(`| ${rowCells.join(' | ')} |`)
      if (i === 0 && tr.querySelectorAll('th').length > 0) {
        rows.push(`|${' --- |'.repeat(rowCells.length)}`)
      }
    })
    result += `\n${rows.join('\n')}\n\n`
  })
  
  return result
}

export function TextInput({ value, onChange, onLoadExample }: TextInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html')
    let plainText = e.clipboardData.getData('text/plain')
    
    console.log('[v0] ===== PASTE EVENT =====')
    
    // First, try to extract HTML tables
    if (html) {
      const tableMarkdown = convertHtmlTablesToMarkdown(html)
      if (tableMarkdown) {
        const existingText = value
        const newText = existingText ? existingText + '\n\n' + tableMarkdown : tableMarkdown
        onChange(newText)
        e.preventDefault()
        return
      }
    }
    
    // If no HTML tables, preserve markdown tables in plain text
    plainText = preserveMarkdownTables(plainText)
    
    // Also try the full HTML to markdown conversion for other elements
    if (html) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      function htmlToMarkdown(node: Node): string {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || ''
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element
          const tag = el.tagName.toLowerCase()
          
          let inner = ''
          for (const child of Array.from(el.childNodes)) {
            inner += htmlToMarkdown(child)
          }
          
          switch (tag) {
            case 'h1': return `\n# ${inner.trim()}\n\n`
            case 'h2': return `\n## ${inner.trim()}\n\n`
            case 'h3': return `\n### ${inner.trim()}\n\n`
            case 'h4': return `\n#### ${inner.trim()}\n\n`
            case 'h5': return `\n##### ${inner.trim()}\n\n`
            case 'h6': return `\n###### ${inner.trim()}\n\n`
            case 'p': return `${inner.trim()}\n\n`
            case 'li':
              console.log("[v0] LI extracted (inner):", inner)
              const parent = el.parentElement
              if (parent && parent.tagName.toLowerCase() === 'ol') {
                return `1. ${inner.trim()}\n`
              }
              return `- ${inner.trim()}\n`
            case 'strong':
            case 'b': return `**${inner}**`
            case 'em':
            case 'i': return `*${inner}*`
            case 'ul':
            case 'ol': return `\n${inner}\n`
            case 'br': return '\n'
            case 'div': return `${inner}\n`
            default: return inner
          }
        }
        return ''
      }
      
      let markdown = htmlToMarkdown(doc.body)
      markdown = markdown.replace(/\n{3,}/g, '\n\n').trim()
      
      console.log('[v0] Full markdown output:', markdown)
      
      if (markdown) {
        const existingText = value
        const newText = existingText ? existingText + '\n\n' + markdown : markdown
        onChange(newText)
        e.preventDefault()
        return
      }
    }
    
    // Final fallback: use preserved plain text
    if (plainText) {
      onChange(plainText)
    }
  }, [value, onChange])
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
  const html = e.clipboardData.getData('text/html')
  
  if (html) {
    // ... process the HTML
    const markdown = convertHtmlToMarkdown(html)
    
    if (markdown) {
      onChange(markdown)
      e.preventDefault()  // <-- THIS MUST BE HERE
      return              // <-- THIS MUST BE HERE
    }
  }
  
  // Fallback to plain text
  const plainText = e.clipboardData.getData('text/plain')
  if (plainText) {
    onChange(plainText)
  }
}, [onChange])
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        onChange(text)
      }
      reader.readAsText(file)
    }
  }, [onChange])
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Paste your AI conversation
        </label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLoadExample}
            className="text-xs"
          >
            <Sparkles className="mr-1.5 h-3 w-3" />
            Try an example
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="mr-1.5 h-3 w-3" />
            Upload .txt
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste text from ChatGPT, DeepSeek, Claude, or any other AI...

The app will automatically detect:
• Headings (# Markdown style, ALL CAPS, or ending with colon:)
• Bullet points (-, *, or numbered lists)
• Tables (markdown format with | and ---)
• Paragraphs and text formatting

You can also drag and drop a .txt file here."
          className="min-h-[280px] resize-none bg-card font-mono text-sm leading-relaxed placeholder:text-muted-foreground/60"
        />
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 px-8 py-4 text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground/60">
                Drop a .txt file here
              </p>
            </div>
          </div>
        )}
      </div>
      
      {value && (
        <p className="text-xs text-muted-foreground">
          {value.split('\n').filter(l => l.trim()).length} lines detected
        </p>
      )}
    </div>
  )
}