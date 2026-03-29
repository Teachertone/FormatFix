'use client'

import { useState, useCallback, useMemo } from 'react'
import { TextInput } from './text-input'
import { DocumentPreview } from './document-preview'
import { ControlPanel } from './control-panel'
import { parseText, type ParsedDocument } from '@/lib/text-parser'
import { getTemplate } from '@/lib/templates'
import { generateWordDocument, downloadBlob } from '@/lib/word-export'
import { exampleContent } from '@/lib/example-content'
import { toast } from 'sonner'

export function ContentBridge() {
  const [inputText, setInputText] = useState('')
  const [templateId, setTemplateId] = useState('one-page-pitch')
  const [styleId, setStyleId] = useState('formal')
  const [colorHeadings, setColorHeadings] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  
  // Parse the input text whenever it changes
  const parsedDocument = useMemo<ParsedDocument>(() => {
    return parseText(inputText)
  }, [inputText])
  
  const selectedTemplate = useMemo(() => {
    return getTemplate(templateId) || null
  }, [templateId])
  
  const handleBlockUpdate = useCallback((blockId: string, newContent: string) => {
    // Rebuild the text with the updated block
    const blocks = parsedDocument.blocks.map(block => {
      if (block.id === blockId) {
        return { ...block, content: newContent }
      }
      return block
    })
    
    // Reconstruct the text
    const newText = blocks.map(block => {
      switch (block.type) {
        case 'heading1':
          return `# ${block.content}`
        case 'heading2':
          return `## ${block.content}`
        case 'bullet':
          return `- ${block.content}`
        case 'numbered':
          return `1. ${block.content}`
        default:
          return block.content
      }
    }).join('\n\n')
    
    setInputText(newText)
  }, [parsedDocument.blocks])
  
  const handleLoadExample = useCallback(() => {
    setInputText(exampleContent)
    setTemplateId('one-page-pitch')
    toast.success('Example loaded', {
      description: 'A sample one-page pitch has been loaded'
    })
  }, [])
  
  const handleExport = useCallback(async () => {
    if (parsedDocument.blocks.length === 0) {
      toast.error('No content to export', {
        description: 'Please paste some text first'
      })
      return
    }
    
    setIsExporting(true)
    
    try {
      const blob = await generateWordDocument({
        blocks: parsedDocument.blocks,
        styleId,
        templateName: selectedTemplate?.name || 'Document'
      })
      
      const filename = `${selectedTemplate?.name || 'Document'}.docx`.replace(/\s+/g, '-')
      downloadBlob(blob, filename)
      
      toast.success('Document exported', {
        description: `${filename} has been downloaded`
      })
    } catch (error) {
      console.error('[v0] Export error:', error)
      toast.error('Export failed', {
        description: 'There was an error generating the Word document'
      })
    } finally {
      setIsExporting(false)
    }
  }, [parsedDocument.blocks, styleId, selectedTemplate])
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                AI Content Bridge
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Transform AI conversations into formatted Word documents
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="space-y-8">
          {/* Control Panel */}
          <ControlPanel
            templateId={templateId}
            styleId={styleId}
            colorHeadings={colorHeadings}
            onTemplateChange={setTemplateId}
            onStyleChange={setStyleId}
            onColorHeadingsChange={setColorHeadings}
            onExport={handleExport}
            isExporting={isExporting}
            hasContent={parsedDocument.blocks.length > 0}
          />
          
          {/* Two Column Layout */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Column */}
            <div>
              <TextInput
                value={inputText}
                onChange={setInputText}
                onLoadExample={handleLoadExample}
              />
            </div>
            
            {/* Preview Column */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Live Preview
                </label>
                {parsedDocument.blocks.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Applying &quot;{styleId.charAt(0).toUpperCase() + styleId.slice(1)}&quot; style
                  </span>
                )}
              </div>
              <DocumentPreview
                document={parsedDocument}
                template={selectedTemplate}
                styleId={styleId}
                colorHeadings={colorHeadings}
                onBlockUpdate={handleBlockUpdate}
              />
            </div>
          </div>
          
          {/* Debug Panel */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="show-debug"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="show-debug" className="text-sm font-medium text-foreground cursor-pointer">
                Show Debug Panel
              </label>
            </div>
            
            {showDebug && (
              <div className="space-y-4 font-mono text-xs bg-muted p-4 rounded-md overflow-x-auto">
                <div>
                  <h3 className="font-bold text-foreground mb-2">Input Lines Analysis:</h3>
                  {inputText.split('\n').map((line, i) => {
                    const trimmed = line.trim()
                    const isDash = /^-\s+/.test(trimmed)
                    const isBulletChar = /^•\s*/.test(trimmed)
                    const isAsterisk = /^\*\s+/.test(trimmed)
                    const isBullet = isDash || isBulletChar || isAsterisk
                    const bulletType = isDash ? 'dash (-)' : isBulletChar ? 'bullet (•)' : isAsterisk ? 'asterisk (*)' : 'none'
                    
                    return (
                      <div key={i} className={`py-1 border-b border-border/50 ${isBullet ? 'text-green-600' : 'text-foreground'}`}>
                        <span className="text-muted-foreground">Line {i + 1}:</span>{' '}
                        <span className="bg-background px-1 rounded">{JSON.stringify(line)}</span>{' '}
                        <span className={isBullet ? 'text-green-600 font-bold' : 'text-red-500'}>
                          {isBullet ? `BULLET (${bulletType})` : 'NOT BULLET'}
                        </span>
                      </div>
                    )
                  })}
                </div>
                
                <div>
                  <h3 className="font-bold text-foreground mb-2">Parsed Blocks ({parsedDocument.blocks.length} total):</h3>
                  {parsedDocument.blocks.length === 0 ? (
                    <div className="text-muted-foreground">No blocks parsed yet</div>
                  ) : (
                    parsedDocument.blocks.map((block, i) => (
                      <div key={block.id} className={`py-1 border-b border-border/50 ${block.type === 'bullet' ? 'text-green-600' : ''}`}>
                        <span className="text-muted-foreground">Block {i + 1}:</span>{' '}
                        <span className={`font-bold ${
                          block.type === 'bullet' ? 'text-green-600' :
                          block.type === 'heading1' ? 'text-blue-600' :
                          block.type === 'heading2' ? 'text-blue-500' :
                          block.type === 'heading3' ? 'text-blue-400' :
                          'text-foreground'
                        }`}>
                          [{block.type.toUpperCase()}]
                        </span>{' '}
                        <span className="bg-background px-1 rounded">{block.content.substring(0, 50)}{block.content.length > 50 ? '...' : ''}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div>
                  <h3 className="font-bold text-foreground mb-2">Expected HTML for bullets:</h3>
                  <code className="text-muted-foreground">
                    {'<ul><li class="ml-4 list-disc">content</li></ul>'}
                  </code>
                </div>
              </div>
            )}
          </div>
          
          {/* Features Info */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">How it works</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Paste</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Paste text from any AI chat
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Customize</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Choose template and style
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Export</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Download as a Word document
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            AI Content Bridge transforms your AI conversations into professional documents
          </p>
        </div>
      </footer>
    </div>
  )
}
