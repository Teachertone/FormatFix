export interface ParsedBlock {
  id: string
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'numbered'
  content: string
  emphasis?: 'bold' | 'italic' | 'bold-italic'
}

export interface ParsedDocument {
  blocks: ParsedBlock[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function detectEmphasis(text: string): { content: string; emphasis?: 'bold' | 'italic' | 'bold-italic' } {
  // Check for bold-italic (***text*** or ___text___)
  if (/^\*\*\*.*\*\*\*$/.test(text.trim()) || /^___.*___$/.test(text.trim())) {
    return {
      content: text.replace(/^\*\*\*|\*\*\*$|^___|___$/g, ''),
      emphasis: 'bold-italic'
    }
  }
  // Check for bold (**text** or __text__)
  if (/^\*\*.*\*\*$/.test(text.trim()) || /^__.*__$/.test(text.trim())) {
    return {
      content: text.replace(/^\*\*|\*\*$|^__|__$/g, ''),
      emphasis: 'bold'
    }
  }
  // Check for italic (*text* or _text_)
  if (/^\*[^*].*[^*]\*$/.test(text.trim()) || /^_[^_].*[^_]_$/.test(text.trim())) {
    return {
      content: text.replace(/^\*|\*$|^_|_$/g, ''),
      emphasis: 'italic'
    }
  }
  return { content: text }
}

function isHeading(line: string): { isHeading: boolean; level: 1 | 2 | 3; content: string } {
  const trimmed = line.trim()
  
  if (trimmed.startsWith('# ')) {
    return { isHeading: true, level: 1, content: trimmed.slice(2) }
  }
  if (trimmed.startsWith('## ')) {
    return { isHeading: true, level: 2, content: trimmed.slice(3) }
  }
  if (trimmed.startsWith('### ')) {
    return { isHeading: true, level: 3, content: trimmed.slice(4) }
  }
  
  if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 50 && /[A-Z]/.test(trimmed)) {
    return { isHeading: true, level: 1, content: trimmed }
  }
  
  if (trimmed.endsWith(':') && trimmed.length < 60 && !trimmed.includes('. ')) {
    return { isHeading: true, level: 2, content: trimmed.slice(0, -1) }
  }
  
  return { isHeading: false, level: 1, content: trimmed }
}

function isBullet(line: string): { isBullet: boolean; content: string } {
  const trimmed = line.trim()
  
  if (/^-\s+/.test(trimmed)) {
    return { isBullet: true, content: trimmed.replace(/^-\s+/, '').trim() }
  }
  
  if (/^•\s*/.test(trimmed)) {
    return { isBullet: true, content: trimmed.replace(/^•\s*/, '').trim() }
  }
  
  if (/^\*\s+/.test(trimmed)) {
    return { isBullet: true, content: trimmed.replace(/^\*\s+/, '').trim() }
  }
  
  return { isBullet: false, content: trimmed }
}

function isNumbered(line: string): { isNumbered: boolean; content: string } {
  const trimmed = line.trim()
  
  if (/^\d+[\.\)]\s+/.test(trimmed)) {
    return { isNumbered: true, content: trimmed.replace(/^\d+[\.\)]\s+/, '') }
  }
  
  return { isNumbered: false, content: trimmed }
}

export function parseText(text: string): ParsedDocument {
  const lines = text.split('\n')
  const blocks: ParsedBlock[] = []
  let currentParagraph: string[] = []
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const content = currentParagraph.join(' ').trim()
      if (content) {
        const { content: cleanContent, emphasis } = detectEmphasis(content)
        blocks.push({
          id: generateId(),
          type: 'paragraph',
          content: cleanContent,
          emphasis
        })
      }
      currentParagraph = []
    }
  }
  
  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed) {
      flushParagraph()
      continue
    }
    
    const bulletCheck = isBullet(trimmed)
    if (bulletCheck.isBullet) {
      flushParagraph()
      const { content: cleanContent, emphasis } = detectEmphasis(bulletCheck.content)
      blocks.push({
        id: generateId(),
        type: 'bullet',
        content: cleanContent,
        emphasis
      })
      continue
    }
    
    const numberedCheck = isNumbered(trimmed)
    if (numberedCheck.isNumbered) {
      flushParagraph()
      const { content: cleanContent, emphasis } = detectEmphasis(numberedCheck.content)
      blocks.push({
        id: generateId(),
        type: 'numbered',
        content: cleanContent,
        emphasis
      })
      continue
    }
    
    const headingCheck = isHeading(trimmed)
    if (headingCheck.isHeading) {
      flushParagraph()
      const { content: cleanContent, emphasis } = detectEmphasis(headingCheck.content)
      const headingType = headingCheck.level === 1 ? 'heading1' : headingCheck.level === 2 ? 'heading2' : 'heading3'
      blocks.push({
        id: generateId(),
        type: headingType,
        content: cleanContent,
        emphasis
      })
      continue
    }
    
    currentParagraph.push(trimmed)
  }
  
  flushParagraph()
  
  return { blocks }
}

export function parseInlineFormatting(text: string): Array<{ text: string; bold?: boolean; italic?: boolean }> {
  const segments: Array<{ text: string; bold?: boolean; italic?: boolean }> = []
  
  const regex = /(\*\*\*[^*]+\*\*\*|___[^_]+___|__[^_]+__|_[^_]+_|\*\*[^*]+\*\*|\*[^*]+\*|[^*_]+)/g
  let match
  
  while ((match = regex.exec(text)) !== null) {
    const segment = match[1]
    
    if ((segment.startsWith('***') && segment.endsWith('***')) || 
        (segment.startsWith('___') && segment.endsWith('___'))) {
      const content = segment.startsWith('***') ? segment.slice(3, -3) : segment.slice(3, -3)
      segments.push({ text: content, bold: true, italic: true })
    }
    else if ((segment.startsWith('**') && segment.endsWith('**')) || 
             (segment.startsWith('__') && segment.endsWith('__'))) {
      const content = segment.startsWith('**') ? segment.slice(2, -2) : segment.slice(2, -2)
      segments.push({ text: content, bold: true })
    }
    else if ((segment.startsWith('*') && segment.endsWith('*') && segment.length > 2) ||
             (segment.startsWith('_') && segment.endsWith('_') && segment.length > 2)) {
      const content = segment.slice(1, -1)
      segments.push({ text: content, italic: true })
    }
    else if (segment) {
      segments.push({ text: segment })
    }
  }
  
  return segments.length > 0 ? segments : [{ text }]
}