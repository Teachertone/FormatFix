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

// Helper function to convert HTML list items to markdown-style bullet points
function convertHtmlToListItems(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const lists = doc.querySelectorAll('ul, ol')
  
  let result = ''
  lists.forEach(list => {
    const items = list.querySelectorAll('li')
    items.forEach(item => {
      if (list.tagName === 'UL') {
        result += `- ${item.textContent?.trim()}\n`
      } else if (list.tagName === 'OL') {
        result += `1. ${item.textContent?.trim()}\n`
      }
    })
    result += '\n'
  })
  
  return result
}

export function TextInput({ value, onChange, onLoadExample }: TextInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
const handlePaste = useCallback((e: React.ClipboardEvent) => {
  // Get everything
  const html = e.clipboardData.getData('text/html')
  const plainText = e.clipboardData.getData('text/plain')
  
  console.log('[v0] ===== PASTE EVENT =====')
  console.log('[v0] Plain text (first 500 chars):', plainText?.substring(0, 500))
  console.log('[v0] HTML (FULL):', html)
  
  // For now, just use plain text so we can see what's happening
  if (plainText) {
    onChange(plainText)
  }
  
  e.preventDefault()
}, [onChange])
  
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