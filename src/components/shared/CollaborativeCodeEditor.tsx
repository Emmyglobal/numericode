import { useEffect, useRef, useState, useCallback } from 'react'
import Editor, { type BeforeMount } from '@monaco-editor/react'
import { Code, Play, Save, Lock, Unlock, Share2, Users, Plus, X, Terminal, FileCode, Globe, Radio, Eraser, Moon, Sun } from 'lucide-react'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/classNames'
import type { TrainerStudent } from '@/features/trainer/types'

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
}

interface CodeData {
  version: number
  files: CodeFile[]
}

interface CodeEditorSession {
  lessonId: string
  codeData: CodeData | null
  isShared: boolean
  isLocked: boolean
  shareType: 'group' | 'individual'
  targetStudentIds: string[]
  revision: number
}

const emptyCodeData: CodeData = {
  version: 1,
  files: [
    {
      id: 'main',
      name: 'main.js',
      language: 'javascript',
      content: '// Welcome to the collaborative code editor!\n// Write your code here and run it together.\nconsole.log("Hello, NumeryCode!");',
    },
  ],
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  html: 'html',
  css: 'css',
  py: 'python',
  python: 'python',
  rb: 'ruby',
  ruby: 'ruby',
  go: 'go',
  rs: 'rust',
  rust: 'rust',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  cs: 'csharp',
  csharp: 'csharp',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
  kotlin: 'kotlin',
  sql: 'sql',
  sh: 'bash',
  bash: 'bash',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  md: 'markdown',
  markdown: 'markdown',
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return SUPPORTED_LANGUAGES[ext] || 'javascript'
}

const configureEditor: BeforeMount = (monaco) => {
  monaco.languages.registerCompletionItemProvider('html', {
    provideCompletionItems: () => ({ suggestions: [
      {
        label: '! (HTML document)',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${1:Document}</title>\n  <link rel="stylesheet" href="${2:styles.css}" />\n</head>\n<body>\n  ${0}\n  <script src="${3:script.js}"></script>\n</body>\n</html>',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Create a complete HTML5 document',
      },
      {
        label: 'html:5',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${0}\n</body>\n</html>',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'Create a basic HTML5 document',
      },
    ] }),
  })
}

export function CollaborativeCodeEditor({
  lessonId,
  mode = 'student',
}: {
  lessonId: string
  mode?: 'student' | 'trainer'
}) {
  const [codeData, setCodeData] = useState<CodeData>(emptyCodeData)
  const [activeFileId, setActiveFileId] = useState('main')
  const [isShared, setIsShared] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [shareType, setShareType] = useState<'group' | 'individual'>('group')
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([])
  const [lastRevision, setLastRevision] = useState(0)
  const [live, setLive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState('')
  const [showOutput, setShowOutput] = useState(false)
  const [message, setMessage] = useState('')
  const [students, setStudents] = useState<TrainerStudent[]>([])
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [darkEditor, setDarkEditor] = useState(true)

  const codeDataRef = useRef(codeData)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const boardPath = `/code-editor/${mode === 'trainer' ? 'trainer/' : ''}lessons/${lessonId}`
  const livePath = `/code-editor/lessons/${lessonId}/live`

  useEffect(() => { codeDataRef.current = codeData }, [codeData])

  // Load initial data
  useEffect(() => {
    const load = mode === 'trainer'
      ? api.get<{ data: CodeEditorSession }>(boardPath).then(r => r.data.data)
      : api.get<{ data: CodeEditorSession }>(`/code-editor/lessons/${lessonId}`).then(r => r.data.data)

    load.then((result: CodeEditorSession) => {
      if (result.codeData?.files) {
        setCodeData(result.codeData)
        setActiveFileId(result.codeData.files[0]?.id ?? 'main')
      }
      setIsShared(result.isShared)
      setIsLocked(result.isLocked)
      setShareType(result.shareType ?? 'group')
      setTargetStudentIds(result.targetStudentIds ?? [])
      setLastRevision(result.revision ?? 0)
    }).catch(() => setMessage('Unable to load saved code editor.'))
  }, [boardPath, lessonId, mode])

  // Students: poll the trainer's shared code editor
  useEffect(() => {
    if (mode === 'trainer') return
    let cancelled = false
    const poll = async () => {
      try {
        const { data } = await api.get<{ data: CodeEditorSession }>(livePath)
        const result = data.data
        if (cancelled) return
        if (result.isShared && result.codeData?.files) {
          setLive(true)
          if ((result.revision ?? 0) > lastRevision) {
            setCodeData(result.codeData)
            setLastRevision(result.revision ?? 0)
          }
          setIsLocked(Boolean(result.isLocked))
        } else {
          setLive(false)
        }
      } catch { /* silent */ }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(id) }
  }, [livePath, mode, lastRevision])

  // Trainer: auto-save debounced
  useEffect(() => {
    if (mode !== 'trainer' || !isShared) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put(boardPath, { codeData: codeDataRef.current })
      } catch { /* silent */ }
    }, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [codeData, boardPath, mode, isShared])

  // Load students for individual targeting
  useEffect(() => {
    if (mode !== 'trainer') return
    api.get<{ data: TrainerStudent[] }>('/trainer/students')
      .then(r => setStudents(r.data.data))
      .catch(() => {})
  }, [mode])

  const activeFile = codeData.files.find(f => f.id === activeFileId) ?? codeData.files[0]

  const updateContent = (content: string) => {
    if (isLocked && mode === 'student') return
    setCodeData(prev => ({
      ...prev,
      files: prev.files.map(f => f.id === activeFileId ? { ...f, content } : f),
    }))
  }

  const addFile = () => {
    const name = newFileName.trim() || 'new.js'
    const id = name.toLowerCase().replace(/[^a-z0-9.]/g, '-')
    setCodeData(prev => ({
      ...prev,
      files: [...prev.files, { id, name, language: detectLanguage(name), content: '' }],
    }))
    setActiveFileId(id)
    setNewFileName('')
    setShowNewFileInput(false)
  }

  const removeFile = (fileId: string) => {
    if (codeData.files.length <= 1) return
    setCodeData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId),
    }))
    if (activeFileId === fileId) {
      setActiveFileId(codeData.files.find(f => f.id !== fileId)?.id ?? codeData.files[0].id)
    }
  }

  const runCode = useCallback(() => {
    if (!activeFile) return
    setRunning(true)
    setShowOutput(true)
    setOutput('Running...\n')

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const logs: string[] = []
        const originalLog = console.log
        console.log = (...args: unknown[]) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '))
        }

        // Execute the code
        const result = new Function(activeFile.content)()
        console.log = originalLog

        const outputLines = [...logs]
        if (result !== undefined) {
          outputLines.push(`=> ${typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}`)
        }
        setOutput(outputLines.join('\n') || 'Code executed successfully (no output)')
      } catch (err) {
        setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`)
      }
      setRunning(false)
    }, 100)
  }, [activeFile])

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      await api.put(boardPath, { codeData })
      setMessage('Code saved.')
    } catch {
      setMessage('Unable to save code.')
    } finally {
      setSaving(false)
    }
  }

  const updateState = async (field: 'isShared' | 'isLocked', value: boolean) => {
    try {
      const response = await api.patch<{ data: { isShared: boolean; isLocked: boolean } }>(boardPath, { [field]: value })
      setIsLocked(response.data.data.isLocked)
      setIsShared(response.data.data.isShared)
      setMessage(field === 'isShared' ? (value ? 'Code editor shared with students.' : 'Code editor is private.') : (value ? 'Editor locked.' : 'Editor unlocked.'))
    } catch {
      setMessage('Unable to update editor settings.')
    }
  }

  const updateShareType = async (type: 'group' | 'individual', studentIds?: string[]) => {
    try {
      const response = await api.patch<{ data: { shareType: string; targetStudentIds: string[]; isShared: boolean } }>(boardPath, {
        shareType: type,
        targetStudentIds: studentIds ?? targetStudentIds,
        isShared: true,
      })
      setShareType(response.data.data.shareType as 'group' | 'individual')
      setTargetStudentIds(response.data.data.targetStudentIds)
      setIsShared(response.data.data.isShared)
      setMessage(type === 'individual' ? 'Code shared with selected students only.' : 'Code shared with all students.')
    } catch {
      setMessage('Unable to update sharing.')
    }
  }

  const resetEditor = () => {
    if (isLocked && mode === 'student') return
    setCodeData(emptyCodeData)
    setOutput('')
    setShowOutput(false)
  }

  return (
    <section aria-labelledby="code-editor-title" className="mb-8 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-surface-dark overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-brand-blue" aria-hidden="true" />
          <h2 id="code-editor-title" className="font-semibold text-gray-900 dark:text-white">Code Editor</h2>
          {mode === 'student' && live && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
              <Radio className="h-3 w-3 animate-pulse" aria-hidden="true" /> Live
            </span>
          )}
          {isLocked && mode === 'student' && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Locked by trainer
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkEditor(!darkEditor)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={darkEditor ? 'Switch to light editor' : 'Switch to dark editor'}
            title={darkEditor ? 'Light theme' : 'Dark theme'}
          >
            {darkEditor ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {mode === 'trainer' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => updateState('isShared', !isShared)}>
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {isShared ? 'Private' : 'Share'}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => updateState('isLocked', !isLocked)}>
                {isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {isLocked ? 'Unlock' : 'Lock'}
              </Button>
            </>
          )}
          <Button size="sm" onClick={save} loading={saving} disabled={isLocked && mode === 'student'}>
            <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save
          </Button>
        </div>
      </div>

      {/* Trainer: Share type selector */}
      {mode === 'trainer' && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Share with:
            </span>
            <button
              type="button"
              onClick={() => updateShareType('group')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', shareType === 'group' ? 'bg-teal text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}
            >
              Group (all students)
            </button>
            <button
              type="button"
              onClick={() => updateShareType('individual')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', shareType === 'individual' ? 'bg-teal text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}
            >
              Individual (select)
            </button>
          </div>
          {shareType === 'individual' && (
            <div className="mt-2">
              <select
                multiple
                value={targetStudentIds}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value)
                  setTargetStudentIds(selected)
                  updateShareType('individual', selected)
                }}
                className="mt-1 h-24 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple students.</p>
            </div>
          )}
        </div>
      )}

      {/* File tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-x-auto">
        <div className="flex">
          {codeData.files.map(file => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-r border-gray-200 dark:border-gray-700 whitespace-nowrap transition-colors',
                file.id === activeFileId
                  ? 'bg-white dark:bg-gray-800 text-brand-blue border-b-2 border-b-brand-blue'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <FileCode className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{file.name}</span>
              {codeData.files.length > 1 && mode === 'trainer' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id) }}
                  className="ml-1 rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
        </div>
        {mode === 'trainer' && (
          <div className="ml-auto pr-2">
            {showNewFileInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="filename.js"
                  className="h-7 w-28 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-xs text-gray-900 dark:text-gray-100"
                  onKeyDown={e => { if (e.key === 'Enter') addFile() }}
                  autoFocus
                />
                <button onClick={addFile} className="rounded p-1 text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Confirm add file">
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setShowNewFileInput(false); setNewFileName('') }} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Cancel add file">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFileInput(true)}
                className="flex items-center gap-1 rounded p-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Add new file"
              >
                <Plus className="h-3.5 w-3.5" /> File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Code editor area */}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 min-h-0">
          <div className="relative min-h-[300px] lg:min-h-[400px]">
            {activeFile && (
              <Editor
                height="400px"
                language={activeFile.language}
                value={activeFile.content}
                onChange={value => updateContent(value ?? '')}
                beforeMount={configureEditor}
                theme={darkEditor ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: isLocked && mode === 'student', minimap: { enabled: false }, fontSize: 14,
                  tabSize: 2, automaticLayout: true, wordWrap: 'on', scrollBeyondLastLine: false,
                  quickSuggestions: true, suggestOnTriggerCharacters: true, snippetSuggestions: 'top',
                  padding: { top: 12, bottom: 12 }, ariaLabel: 'Code editor',
                }}
              />
            )}
          </div>
        </div>

        {/* Output panel */}
        {showOutput && (
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5" /> Output
              </span>
              <button
                onClick={() => setShowOutput(false)}
                className="rounded p-0.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close output"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <pre className="flex-1 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 overflow-auto min-h-[100px] max-h-[300px] whitespace-pre-wrap">
              {output || 'Click "Run" to execute the code.'}
            </pre>
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between gap-2 border-t border-gray-200 dark:border-gray-700 px-4 py-2.5 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={runCode} loading={running} disabled={isLocked && mode === 'student'}>
            <Play className="h-3.5 w-3.5" aria-hidden="true" /> Run
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowOutput(!showOutput)}>
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" /> Output
          </Button>
          <Button size="sm" variant="ghost" onClick={resetEditor} disabled={isLocked && mode === 'student'}>
            <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> Reset
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Globe className="h-3 w-3" aria-hidden="true" />
          <span>{activeFile?.language ?? 'javascript'}</span>
          {live && mode === 'student' && (
            <span className="text-red-500 font-medium flex items-center gap-1">
              <Radio className="h-3 w-3 animate-pulse" /> Live mode
            </span>
          )}
        </div>
      </div>

      {message && <p aria-live="polite" className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">{message}</p>}
    </section>
  )
}
