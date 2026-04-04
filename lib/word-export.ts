import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx'
import type { ParsedBlock } from './text-parser'

interface GenerateOptions {
  blocks: ParsedBlock[]
  styleId: string
  templateName: string
}

// Helper to download blob as file
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

// Parse markdown table from a string
function parseMarkdownTable(content: string): { isTable: boolean; rows: string[][] } {
  const lines = content.split('\n')
  const tableRows: string[][] = []
  let inTable = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('|') && line.endsWith('|')) {
      // Split by | and clean
      let cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      
      // Skip if this is a separator row (all cells are dashes)
      const isSeparator = cells.length > 0 && cells.every(cell => /^[\-\:]+$/.test(cell))
      
      if (isSeparator) {
        inTable = true
        continue // Skip this row entirely
      }
      
      if (cells.length > 0 && !isSeparator) {
        inTable = true
        tableRows.push(cells)
      }
    } else if (inTable) {
      break
    }
  }
  
  return { isTable: tableRows.length > 0, rows: tableRows }
}

export async function generateWordDocument({ blocks, styleId, templateName }: GenerateOptions): Promise<Blob> {
  const children: any[] = []
  
  for (const block of blocks) {
    const { isTable, rows } = parseMarkdownTable(block.content)
    
    if (isTable && rows.length > 0) {
      const tableRows = rows.map(row => {
        const cells = row.map(cell => 
          new TableCell({
            children: [new Paragraph({ children: [new TextRun(cell.trim())] })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          })
        )
        return new TableRow({ children: cells })
      })
      
      children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }))
      children.push(new Paragraph({ text: '' }))
    } else {
      switch (block.type) {
        case 'heading1':
          children.push(new Paragraph({ text: block.content, heading: 'Heading1', spacing: { before: 240, after: 120 } }))
          break
        case 'heading2':
          children.push(new Paragraph({ text: block.content, heading: 'Heading2', spacing: { before: 200, after: 80 } }))
          break
        case 'heading3':
          children.push(new Paragraph({ text: block.content, heading: 'Heading3', spacing: { before: 160, after: 60 } }))
          break
        case 'bullet':
          children.push(new Paragraph({ text: block.content, bullet: { level: 0 } }))
          break
        case 'numbered':
          children.push(new Paragraph({ text: block.content, numbering: { reference: "numbering-ref", level: 0 } }))
          break
        default:
          children.push(new Paragraph({ text: block.content, spacing: { after: 120 } }))
      }
    }
  }
  
  const doc = new Document({ sections: [{ properties: {}, children }] })
  const blob = await Packer.toBlob(doc)
  return blob
}