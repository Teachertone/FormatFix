import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } from 'docx'
import { parseInlineFormatting, type ParsedBlock } from './text-parser'
import { applyStyle } from './styles'

// Create TextRuns with inline formatting support
function createFormattedTextRuns(text: string, baseSize: number, baseOptions?: { bold?: boolean; italics?: boolean }): TextRun[] {
  const segments = parseInlineFormatting(text)
  return segments.map(segment => new TextRun({
    text: segment.text,
    size: baseSize,
    font: 'Calibri',
    bold: segment.bold || baseOptions?.bold,
    italics: segment.italic || baseOptions?.italics
  }))
}

export interface ExportOptions {
  blocks: ParsedBlock[]
  styleId: string
  templateName: string
}

export async function generateWordDocument(options: ExportOptions): Promise<Blob> {
  const { blocks, styleId, templateName } = options
  
  const children: Paragraph[] = []
  
  // Add title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: templateName,
          bold: true,
          size: 32, // 16pt
          font: 'Calibri'
        })
      ],
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 }
    })
  )
  
  let bulletIndex = 0
  let numberedIndex = 0
  
  for (const block of blocks) {
    const styledContent = applyStyle(block.content, styleId)
    
    switch (block.type) {
      case 'heading1':
        children.push(
          new Paragraph({
            children: createFormattedTextRuns(styledContent, 28, { bold: true }),
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          })
        )
        bulletIndex = 0
        numberedIndex = 0
        break
        
      case 'heading2':
        children.push(
          new Paragraph({
            children: createFormattedTextRuns(styledContent, 24, { bold: true }),
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 }
          })
        )
        bulletIndex = 0
        numberedIndex = 0
        break
        
      case 'heading3':
        children.push(
          new Paragraph({
            children: createFormattedTextRuns(styledContent, 22, { bold: true }),
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 250, after: 120 }
          })
        )
        bulletIndex = 0
        numberedIndex = 0
        break
        
      case 'bullet':
        children.push(
          new Paragraph({
            children: createFormattedTextRuns(styledContent, 22, {
              bold: block.emphasis === 'bold' || block.emphasis === 'bold-italic',
              italics: block.emphasis === 'italic' || block.emphasis === 'bold-italic'
            }),
            bullet: {
              level: 0
            },
            spacing: { before: 100, after: 100 }
          })
        )
        bulletIndex++
        break
        
      case 'numbered':
        numberedIndex++
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${numberedIndex}. `,
                size: 22,
                font: 'Calibri'
              }),
              ...createFormattedTextRuns(styledContent, 22, {
                bold: block.emphasis === 'bold' || block.emphasis === 'bold-italic',
                italics: block.emphasis === 'italic' || block.emphasis === 'bold-italic'
              })
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: convertInchesToTwip(0.25) }
          })
        )
        break
        
      default: // paragraph
        children.push(
          new Paragraph({
            children: createFormattedTextRuns(styledContent, 22, {
              bold: block.emphasis === 'bold' || block.emphasis === 'bold-italic',
              italics: block.emphasis === 'italic' || block.emphasis === 'bold-italic'
            }),
            spacing: { before: 100, after: 200 },
            alignment: AlignmentType.JUSTIFIED
          })
        )
        bulletIndex = 0
        numberedIndex = 0
    }
  }
  
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1)
            }
          }
        },
        children
      }
    ]
  })
  
  return Packer.toBlob(doc)
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
