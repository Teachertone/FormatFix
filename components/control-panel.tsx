'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { templates } from '@/lib/templates'
import { stylePresets } from '@/lib/styles'
import { FileDown, Loader2 } from 'lucide-react'

interface ControlPanelProps {
  templateId: string
  styleId: string
  colorHeadings: boolean
  onTemplateChange: (id: string) => void
  onStyleChange: (id: string) => void
  onColorHeadingsChange: (checked: boolean) => void
  onExport: () => void
  isExporting: boolean
  hasContent: boolean
}

export function ControlPanel({
  templateId,
  styleId,
  colorHeadings,
  onTemplateChange,
  onStyleChange,
  onColorHeadingsChange,
  onExport,
  isExporting,
  hasContent
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Template Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Template
          </label>
          <Select value={templateId} onValueChange={onTemplateChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex flex-col items-start">
                    <span>{template.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Style Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Writing Style
          </label>
          <Select value={styleId} onValueChange={onStyleChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {stylePresets.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <div className="flex flex-col items-start">
                    <span>{style.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Color Headings Checkbox */}
        <div className="flex items-center gap-2 sm:self-end sm:pb-2">
          <Checkbox 
            id="color-headings" 
            checked={colorHeadings}
            onCheckedChange={onColorHeadingsChange}
          />
          <label 
            htmlFor="color-headings" 
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            Add colour to headings
          </label>
        </div>
      </div>
      
      {/* Export Button */}
      <Button
        size="lg"
        onClick={onExport}
        disabled={!hasContent || isExporting}
        className="w-full sm:w-auto"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" />
            Export to Word
          </>
        )}
      </Button>
    </div>
  )
}
