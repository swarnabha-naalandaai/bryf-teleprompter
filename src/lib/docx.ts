import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
]

export function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] })
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Base paragraph gap, in em - one blank line between paragraphs. */
const PARA_GAP_EM = 0.6
const MAX_EXTRA_BLANK_LINES = 3

/**
 * Plain text -> paragraphs. A blank line splits paragraphs; single newlines
 * become <br>. Extra consecutive blank lines widen the gap proportionally
 * (capped) rather than being collapsed, so an operator can write a longer
 * pause into the script the same way they'd write it on paper.
 */
export function textToHtml(text: string): string {
  const chunks = text.split(/(\n{2,})/)
  const blocks: { text: string; extraBlankLines: number }[] = []

  for (let i = 0; i < chunks.length; i += 2) {
    const block = chunks[i].trim()
    if (!block) continue
    const separator = chunks[i + 1] ?? ''
    const extraBlankLines = Math.min(Math.max(separator.length - 2, 0), MAX_EXTRA_BLANK_LINES)
    blocks.push({ text: block, extraBlankLines })
  }

  return blocks
    .map(({ text: block, extraBlankLines }, i) => {
      const isLast = i === blocks.length - 1
      const gapStyle =
        !isLast && extraBlankLines > 0
          ? ` style="margin-bottom:${(1 + extraBlankLines) * PARA_GAP_EM}em"`
          : ''
      return `<p${gapStyle}>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`
    })
    .join('')
}

/** Sanitized HTML -> plain text, for round-tripping into the editor. */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const elements = Array.from(doc.body.children).filter((el) => (el.textContent ?? '').trim())

  return elements
    .map((el, i) => {
      const text = (el.textContent ?? '').trim()
      if (i === elements.length - 1) return text
      const gapEm = parseFloat((el as HTMLElement).style.marginBottom || '') || PARA_GAP_EM
      const extraBlankLines = Math.max(Math.round(gapEm / PARA_GAP_EM) - 1, 0)
      return text + '\n'.repeat(2 + extraBlankLines)
    })
    .join('')
}

class DocxError extends Error {}

export async function importDocx(file: File): Promise<string> {
  let value: string
  try {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    ;({ value } = await mammoth.convertToHtml({ arrayBuffer }))
  } catch {
    // jszip/mammoth errors are unreadable on a teleprompter - say the useful part
    throw new DocxError(`Could not read "${file.name}". Is it a real .docx file?`)
  }

  const html = sanitize(value)
  if (!html.replace(/<[^>]*>/g, '').trim()) {
    throw new DocxError(`"${file.name}" has no readable text.`)
  }
  return html
}
