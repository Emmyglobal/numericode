import type { ReactNode } from 'react'

/**
 * Minimal Markdown renderer used for course notes and lesson content.
 *
 * No external dependency — it supports the block syntax used across the
 * NumeriCode course material (headings, bullet & numbered lists, HR, and
 * paragraphs) plus inline emphasis (`**bold**`, `*italic*`, `` `code` ``).
 * Everything is rendered as React elements (no dangerouslySetInnerHTML), so
 * no user-supplied HTML/Script can execute.
 */

function renderInline(source: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(source)) !== null) {
    const token = m[0]
    if (m.index > last) nodes.push(source.slice(last, m.index))
    const key = `${keyPrefix}-${k++}`
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      nodes.push(
        <code key={key} className="rounded bg-gray-100 dark:bg-gray-800 px-1 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else {
      nodes.push(token)
    }
    last = m.index + token.length
  }
  if (last < source.length) nodes.push(source.slice(last))
  return nodes
}

interface ListBuf {
  kind: 'ul' | 'ol'
  items: string[]
}

export function Markdown({ text, className }: { text?: string; className?: string }) {
  if (!text) return null
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let list: ListBuf | null = null

  const flush = (key: string) => {
    if (!list) return
    const buf = list
    if (buf.kind === 'ul') {
      blocks.push(
        <ul key={key} className="list-disc pl-6 space-y-1">
          {buf.items.map((it, i) => (
            <li key={i}>{renderInline(it, `ul-${i}`)}</li>
          ))}
        </ul>,
      )
    } else {
      blocks.push(
        <ol key={key} className="list-decimal pl-6 space-y-1">
          {buf.items.map((it, i) => (
            <li key={i}>{renderInline(it, `ol-${i}`)}</li>
          ))}
        </ol>,
      )
    }
    list = null
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim()
    if (!line) {
      flush(`list-${idx}`)
      return
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      flush(`list-${idx}`)
      const level = heading[1].length
      const content = renderInline(heading[2], `h-${idx}`)
      if (level === 1) blocks.push(<h2 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{content}</h2>)
      else if (level === 2) blocks.push(<h3 key={idx} className="text-lg font-bold text-gray-900 dark:text-white mt-3 mb-1.5">{content}</h3>)
      else blocks.push(<h4 key={idx} className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-1.5">{content}</h4>)
      return
    }

    if (/^-{3,}$/.test(line)) {
      flush(`list-${idx}`)
      blocks.push(<hr key={idx} className="my-4 border-gray-200 dark:border-gray-700" />)
      return
    }

    const ulMatch = /^[-*]\s+(.*)$/.exec(line)
    if (ulMatch) {
      if (list && list.kind === 'ul') list.items.push(ulMatch[1])
      else {
        flush(`list-${idx}`)
        list = { kind: 'ul', items: [ulMatch[1]] }
      }
      return
    }

    const olMatch = /^\d+[.)]\s+(.*)$/.exec(line)
    if (olMatch) {
      if (list && list.kind === 'ol') list.items.push(olMatch[1])
      else {
        flush(`list-${idx}`)
        list = { kind: 'ol', items: [olMatch[1]] }
      }
      return
    }

    flush(`list-${idx}`)
    blocks.push(<p key={idx} className="mb-2">{renderInline(line, `p-${idx}`)}</p>)
  })
  flush('list-final')

  return <div className={className}>{blocks}</div>
}
