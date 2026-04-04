import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx'
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

function parseMarkdownTable(content: string): { isTable: boolean; rows: string[][] } {
  const lines = content.split('\n')
  const tableRows: string[][] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) continue
    
    const cells = trimmed.split('|').filter(cell => {
      const clean = cell.trim()
      return clean !== '' && clean !== '---' && !/^\-+$/.test(clean)
    })
    
    if (cells.length === 0) continue
    
    // Skip separator rows (all dashes)
    if (cells.every(cell => /^[\-\:]+$/.test(cell.trim()))) continue
    
    tableRows.push(cells)
  }
  
  return { isTable: tableRows.length > 0, rows: tableRows }
}

export async function generateWordDocument({ blocks, styleId, templateName }: GenerateOptions): Promise<Blob> {
  const children: any[] = []
  
  for (const block of blocks) {
    const { isTable, rows } = parseMarkdownTable(block.content)
    
    if (isTable && rows.length > 0) {
      const tableCells = rows.map(row => 
        row.map(cell => 
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
      )
      
      const tableRows = tableCells.map(cells => new TableRow({ children: cells }))
      
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
  return await Packer.toBlob(doc)
}