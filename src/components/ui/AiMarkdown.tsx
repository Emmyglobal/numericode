import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import 'katex/dist/katex.min.css'
import 'prismjs/themes/prism-okaidia.css'
import { cn } from '@/utils/classNames'
import { Check, Copy } from 'lucide-react'

/**
 * Markdown renderer used only by the AI chat to render `answer` content.
 * Separate from `Markdown.tsx` (course notes) so course content is untouched.
 * - remark-gfm    -> tables, task lists, strikethrough, autolinks, nested lists
 * - remark-math   -> $...$ / $$...$$ maths
 * - rehype-katex  -> renders maths with KaTeX (already a NumeryCode dependency)
 * - rehype-prism-plus -> syntax highlighting for fenced code
 * Raw HTML is NOT rendered (react-markdown default) — AI HTML cannot execute.
 */

function useCopier() {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => void 0)
  }
  return { copied, copy }
}

/** Extract code text + language from a `pre > code` react-markdown tree. */
function extractCode(preChildren: unknown): { language: string | null; code: string } {
  const child = (Array.isArray(preChildren) ? preChildren[0] : preChildren) as
    | { type?: unknown; props?: { children?: unknown; className?: string } }
    | undefined
  const props = child?.props ?? {}
  const className = typeof props.className === 'string' ? props.className : ''
  const language = /language-(\w+)/.exec(className)?.[1] ?? null
  const code = ReactNodeToString(props.children ?? '')
  return { language, code }
}

function ReactNodeToString(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(ReactNodeToString).join('')
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const props = (node as { props?: { children?: unknown } }).props ?? {}
    return ReactNodeToString(props.children)
  }
  return ''
}

/** Props for custom react-markdown element overrides (includes mdast `node`). */
type MdProps<T extends keyof HTMLElementTagNameMap> = ComponentProps<T> & { node?: unknown }

const components = {
  pre: ({ children, className, ...props }: ComponentProps<'pre'>) => {
    const { language, code } = extractCode(children)
    const { copied, copy } = useCopier()
    return (
      <pre
        {...props}
        className={cn(
          'relative my-3 overflow-x-auto rounded-xl bg-slate-800/95 p-3 pr-10 text-sm text-slate-200',
          className,
        )}
      >
        {children}
        {language && (
          <span className="absolute top-2 left-3 text-[10px] font-medium uppercase text-slate-400">
            {language}
          </span>
        )}
        <button
          type="button"
          onClick={() => copy(code)}
          aria-label={copied ? 'Copied code' : 'Copy code'}
          className="absolute top-2 right-2 rounded-md bg-black/30 p-1.5 text-slate-300 opacity-70 hover:opacity-100 hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          title="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </pre>
    )
  },
  code: ({ node, className, children, ...props }: MdProps<'code'>) => {
    const isBlock = Boolean(className) && /^language-/.test(className)
    return (
      <code
        {...props}
        className={cn(
          'font-mono',
          isBlock
            ? 'block break-words'
            : 'inline rounded px-1 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-200',
          className,
        )}
      >
        {children}
      </code>
    )
  },
  a: ({ node, className, ...props }: MdProps<'a'>) => {
    const href = props.href ?? ''
    const isExternal = /^https?:\/\//i.test(href)
    return (
      <a
        {...props}
        href={href}
        className={cn(
          'underline decoration-brand-blue/40 underline-offset-2 text-brand-blue dark:text-brand-sky hover:decoration-brand-blue',
          className,
        )}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
      />
    )
  },
  table: ({ node, className, ...props }: MdProps<'table'>) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table {...props} className={cn('border-collapse text-sm', className)} />
    </div>
  ),
  th: ({ node, className, ...props }: MdProps<'th'>) => (
    <th
      {...props}
      className={cn(
        'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-left align-top font-semibold',
        className,
      )}
    />
  ),
  td: ({ node, className, ...props }: MdProps<'td'>) => (
    <td
      {...props}
      className={cn('border border-slate-200 dark:border-slate-700 px-3 py-2 align-top', className)}
    />
  ),
  blockquote: ({ node, className, ...props }: MdProps<'blockquote'>) => (
    <blockquote
      {...props}
      className={cn(
        'my-3 border-l-4 border-brand-blue/30 pl-4 italic text-slate-600 dark:border-brand-blue/40 dark:text-slate-300',
        className,
      )}
    />
  ),
  hr: ({ node, className, ...props }: MdProps<'hr'>) => (
    <hr {...props} className={cn('my-4 border-gray-200 dark:border-slate-700', className)} />
  ),
  p: ({ node, className, ...props }: MdProps<'p'>) => (
    <p {...props} className={cn('mb-3 text-base leading-7 text-slate-700 dark:text-slate-200', className)} />
  ),
  ul: ({ node, className, ...props }: MdProps<'ul'>) => (
    <ul {...props} className={cn('my-2 ml-5 list-disc space-y-1 text-slate-700 dark:text-slate-200', className)} />
  ),
  ol: ({ node, className, ...props }: MdProps<'ol'>) => (
    <ol {...props} className={cn('my-2 ml-5 list-decimal space-y-1 text-slate-700 dark:text-slate-200', className)} />
  ),
  li: ({ node, className, ...props }: MdProps<'li'>) => (
    <li {...props} className={cn('ml-1 leading-relaxed', className)} />
  ),
  img: ({ node, className, ...props }: MdProps<'img'>) => (
    <img
      {...props}
      alt={props.alt ?? ''}
      loading="lazy"
      className={cn('my-3 max-w-full rounded-lg', className)}
    />
  ),
  h1: Heading({ level: 1 }),
  h2: Heading({ level: 2 }),
  h3: Heading({ level: 3 }),
  h4: Heading({ level: 4 }),
  h5: Heading({ level: 5 }),
  h6: Heading({ level: 6 }),
}


/** Heading factory so all levels share a consistent style map. */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
const HEADING_STYLES: Record<HeadingLevel, string> = {
  1: 'mt-6 mb-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white',
  2: 'mt-5 mb-2 text-xl font-bold text-slate-800 dark:text-slate-100',
  3: 'mt-4 mb-2 text-lg font-bold text-slate-800 dark:text-slate-100',
  4: 'mt-3 mb-1 text-base font-bold text-slate-800 dark:text-slate-100',
  5: 'mt-3 mb-1 text-sm font-bold text-slate-800 dark:text-slate-100',
  6: 'mt-3 mb-1 text-sm font-bold text-slate-800 dark:text-slate-100',
}
function Heading({ level }: { level: HeadingLevel }) {
  const Tag = `h${level}` as const
  return ({
    children,
    className,
    ...props
  }: { children?: ReactNode; className?: string; [k: string]: unknown }) => (
    <Tag className={cn(HEADING_STYLES[level], className)} {...props}>
      {children}
    </Tag>
  )
}

export interface AiMarkdownProps {
  markdown: string
}

/** Markdown renderer entry point used by the AI chat. */
export function AiMarkdown({ markdown }: AiMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeKatex, { throwOnError: false, strict: false, trust: false }],
        [rehypePrismPlus, { showLineNumbers: false }],
      ]}
      components={components}
    >
      {markdown}
    </ReactMarkdown>
  )
}

export default AiMarkdown

