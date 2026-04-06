import { Packer, Document, Paragraph } from 'docx'
import type { ParsedBlock } from './text-parser'

interface GenerateOptions {
  blocks: ParsedBlock[]
  styleId: string
  templateName: string
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function generateWordDocument({ blocks, styleId, templateName }: GenerateOptions): Promise<Blob> {
  const children: any[] = []
  let numberedCount = 0
  let lastWasNumbered = false
  
  for (const block of blocks) {
    switch (block.type) {
      case 'heading1':
        numberedCount = 0
        lastWasNumbered = false
        children.push(new Paragraph({ text: block.content, heading: 'Heading1', spacing: { before: 240, after: 120 } }))
        break
        
      case 'heading2':
        numberedCount = 0
        lastWasNumbered = false
        children.push(new Paragraph({ text: block.content, heading: 'Heading2', spacing: { before: 200, after: 80 } }))
        break
        
      case 'heading3':
        numberedCount = 0
        lastWasNumbered = false
        children.push(new Paragraph({ text: block.content, heading: 'Heading3', spacing: { before: 160, after: 60 } }))
        break
        
      case 'bullet':
        lastWasNumbered = false
        children.push(new Paragraph({ text: block.content, bullet: { level: 0 } }))
        break
        
      case 'numbered':
        if (!lastWasNumbered) {
          numberedCount = 0
        }
        numberedCount++
        lastWasNumbered = true
        // Plain text with number — no bullet formatting
        children.push(new Paragraph({ text: `${numberedCount}. ${block.content}` }))
        break
        
      default:
        numberedCount = 0
        lastWasNumbered = false
        children.push(new Paragraph({ text: block.content, spacing: { after: 120 } }))
    }
  }
  
  const doc = new Document({ sections: [{ properties: {}, children }] })
  return await Packer.toBlob(doc)
}