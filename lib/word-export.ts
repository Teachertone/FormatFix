import { Packer, Document, Paragraph, Indent } from 'docx'
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
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    
    switch (block.type) {
      case 'heading1':
        numberedCount = 0
        children.push(new Paragraph({ text: block.content, heading: 'Heading1', spacing: { before: 240, after: 120 } }))
        break
        
      case 'heading2':
        numberedCount = 0
        children.push(new Paragraph({ text: block.content, heading: 'Heading2', spacing: { before: 200, after: 80 } }))
        break
        
      case 'heading3':
        numberedCount = 0
        children.push(new Paragraph({ text: block.content, heading: 'Heading3', spacing: { before: 160, after: 60 } }))
        break
        
      case 'bullet':
        // Use Word's bullet with custom indent to match numbers
        children.push(new Paragraph({
          text: block.content,
          bullet: { level: 0 },
          indent: { left: 360, hanging: 360 }
        }))
        break
        
      case 'numbered':
        numberedCount++
        children.push(new Paragraph({
          text: `${numberedCount}. ${block.content}`,
          indent: { left: 360, hanging: 360 }
        }))
        break
        
      default:
        numberedCount = 0
        children.push(new Paragraph({ text: block.content, spacing: { after: 120 } }))
    }
  }
  
  const doc = new Document({ sections: [{ properties: {}, children }] })
  return await Packer.toBlob(doc)
}