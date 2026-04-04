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

// Detect if text contains a space-aligned table and convert to markdown
function convertSpaceAlignedTable(text: string): string {
  const lines = text.split('\n')
  
  // Find lines that look like a table (multiple spaces, not just one)
  let tableStart = -1
  let tableEnd = -1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Check if line has multiple spaces (potential table row)
    if (line.includes('  ') && line.trim().length > 10) {
      if (tableStart === -1) tableStart = i
      tableEnd = i
    } else if (tableStart !== -1) {
      break
    }
  }
  
  if (tableStart === -1 || tableEnd === -1) return text
  
  // Extract table lines
  const tableLines = lines.slice(tableStart, tableEnd + 1)
  
  // Parse columns by splitting on multiple spaces
  const rows = tableLines.map(line => {
    // Split on 2+ spaces
    const cells = line.split(/\s{2,}/).map(cell => cell.trim())
    return cells
  })
  
  if (rows.length < 2) return text
  
  // Find max columns
  const maxCols = Math.max(...rows.map(row => row.length))
  if (maxCols < 2) return text
  
  // Build markdown table
  const headerRow = rows[0]
  const markdownRows: string[] = []
  
  // Header
  markdownRows.push(`| ${headerRow.join(' | ')} |`)
  // Separator
  markdownRows.push(`|${' --- |'.repeat(headerRow.length)}`)
  // Data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    // Pad row to match header length
    while (row.length < headerRow.length) row.push('')
    markdownRows.push(`| ${row.join(' | ')} |`)
  }
  
  // Replace the original lines with the markdown table
  const before = lines.slice(0, tableStart).join('\n')
  const after = lines.slice(tableEnd + 1).join('\n')
  
  return [before, markdownRows.join('\n'), after].filter(p => p.trim()).join('\n\n')
}

export function TextInput({ value, onChange, onLoadExample }: TextInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    let text = e.clipboardData.getData('text/plain')
    
    console.log('[v0] Pasted plain text:', text)
    
    // Try to detect and convert space-aligned tables
    text = convertSpaceAlignedTable(text)
    
    if (text) {
      e.preventDefault()
      const existingText = value
      const newText = existingText ? existingText + '\n\n' + text : text
      onChange(newText)
    }
  }, [value, onChange])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        onChange(text)
      }
      reader.readAsText(file)
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
• Tables (markdown format with | and ---, or space-aligned text)
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