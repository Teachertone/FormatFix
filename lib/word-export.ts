import { Packer, Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx'
import type { ParsedBlock } from './text-parser'

interface GenerateOptions {
  blocks: ParsedBlock[]
  styleId: string
  templateName: string
}

// Parse markdown table from a string
function parseMarkdownTable(content: string): { isTable: boolean; rows: string[][] } {
  const lines = content.split('\n')
  const tableRows: string[][] = []
  let inTable = false
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Split by | and filter out empty cells and separator rows
      const cells = trimmed.split('|').filter(cell => {
        const clean = cell.trim()
        return clean !== '' && clean !== '---' && !/^\-+$/.test(clean)
      })
      if (cells.length > 0) {
        inTable = true
        tableRows.push(cells)
      }
    } else if (inTable) {
      // End of table
      break
    }
  }
  
  return { isTable: inTable && tableRows.length > 0, rows: tableRows }
}

export async function generateWordDocument({ blocks, styleId, templateName }: GenerateOptions): Promise<Blob> {
  console.log("[v0] Export called with blocks:", blocks.length)
  
  for (const block of blocks) {
    console.log("[v0] Export block content:", block.content.substring(0, 100))
  }
  // ... rest of the function
    
    if (isTable && rows.length > 0) {
      console.log("[v0] Export - creating Word table with", rows.length, "rows")
      
      // Create a Word table
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
      
      children.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      }))
      children.push(new Paragraph({ text: '' })) // Add spacing after table
      
    } else {
      // Handle regular blocks
      switch (block.type) {
        case 'heading1':
          children.push(new Paragraph({
            text: block.content,
            heading: 'Heading1',
            spacing: { before: 240, after: 120 },
          }))
          break
        case 'heading2':
          children.push(new Paragraph({
            text: block.content,
            heading: 'Heading2',
            spacing: { before: 200, after: 80 },
          }))
          break
        case 'heading3':
          children.push(new Paragraph({
            text: block.content,
            heading: 'Heading3',
            spacing: { before: 160, after: 60 },
          }))
          break
        case 'bullet':
          children.push(new Paragraph({
            text: block.content,
            bullet: { level: 0 },
          }))
          break
        case 'numbered':
          children.push(new Paragraph({
            text: block.content,
            numbering: { reference: "numbering-ref", level: 0 },
          }))
          break
        default:
          children.push(new Paragraph({
            text: block.content,
            spacing: { after: 120 },
          }))
      }
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })
  
  const blob = await Packer.toBlob(doc)
  return blob
}