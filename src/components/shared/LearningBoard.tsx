import { useEffect, useRef, useState } from 'react'
import { Eraser, Highlighter, MousePointer2, Pencil, Radio, Redo2, RotateCcw, Save, Square, Type, Undo2, ZoomIn, ZoomOut, Users } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/classNames'
import type { TrainerStudent } from '@/features/trainer/types'

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'ellipse' | 'text'
type Point = { x: number; y: number }
type Element = { id: string; tool: Tool; points?: Point[]; start?: Point; end?: Point; text?: string; color: string }
type BoardDocument = { version: 1; elements: Element[] }
const emptyBoard: BoardDocument = { version: 1, elements: [] }
const tools: Array<{ id: Tool; label: string; Icon: typeof Pencil }> = [
  { id: 'pen', label: 'Pen', Icon: Pencil },
  { id: 'highlighter', label: 'Highlighter', Icon: Highlighter },
  { id: 'eraser', label: 'Eraser', Icon: Eraser },
  { id: 'rectangle', label: 'Rectangle', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', Icon: MousePointer2 },
  { id: 'text', label: 'Text', Icon: Type },
]

function drawElement(context: CanvasRenderingContext2D, element: Element) {
  context.save()
  context.strokeStyle = element.tool === 'eraser' ? '#ffffff' : element.color
  context.fillStyle = element.color
  context.lineWidth = element.tool === 'highlighter' ? 14 : element.tool === 'eraser' ? 18 : 3
  context.globalAlpha = element.tool === 'highlighter' ? 0.35 : 1
  context.lineCap = 'round'
  context.lineJoin = 'round'
  if (element.points && element.points.length > 1) {
    context.beginPath()
    context.moveTo(element.points[0].x, element.points[0].y)
    element.points.slice(1).forEach(point => context.lineTo(point.x, point.y))
    context.stroke()
  } else if (element.start && element.end) {
    const width = element.end.x - element.start.x
    const height = element.end.y - element.start.y
    if (element.tool === 'ellipse') {
      context.beginPath()
      context.ellipse(element.start.x + width / 2, element.start.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2)
      context.stroke()
    } else if (element.tool === 'text') {
      context.globalAlpha = 1
      context.font = '18px sans-serif'
      context.fillText(element.text ?? 'Text', element.start.x, element.start.y)
    } else {
      context.strokeRect(element.start.x, element.start.y, width, height)
    }
  }
  context.restore()
}

export function LearningBoard({ lessonId, mode = 'student' }: { lessonId: string; mode?: 'student' | 'trainer' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [board, setBoard] = useState<BoardDocument>(emptyBoard)
  const [history, setHistory] = useState<BoardDocument[]>([emptyBoard])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#1d4ed8')
  const [zoom, setZoom] = useState(1)
  const [draft, setDraft] = useState<Element | null>(null)
  const [locked, setLocked] = useState(false)
  const [shared, setShared] = useState(false)
  const [boardType, setBoardType] = useState<'group' | 'individual'>('group')
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([])
  const [students, setStudents] = useState<TrainerStudent[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [live, setLive] = useState(false)
  const [lastRevision, setLastRevision] = useState(0)
  const boardRef = useRef(board)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const boardPath = `/boards/${mode === 'trainer' ? 'trainer/' : ''}lessons/${lessonId}`
  const livePath = `/boards/lessons/${lessonId}/live`

  useEffect(() => { boardRef.current = board }, [board])

  useEffect(() => {
    const load = mode === 'trainer'
      ? api.get<{ data: unknown }>(boardPath).then(response => response.data.data)
      : dashboardService.getBoard(lessonId)
    load.then((data: unknown) => {
      const result = data as { boardData?: BoardDocument; isLocked?: boolean; isShared?: boolean; boardType?: 'group' | 'individual'; targetStudentIds?: string[]; revision?: number }
      const loaded = result.boardData?.elements ? result.boardData : emptyBoard
      setBoard(loaded)
      setHistory([loaded])
      setHistoryIndex(0)
      setLocked(Boolean(result.isLocked))
      setShared(Boolean(result.isShared))
      setBoardType(result.boardType ?? 'group')
      setTargetStudentIds(result.targetStudentIds ?? [])
      setLastRevision(result.revision ?? 0)
    }).catch(() => setMessage('Unable to load saved board notes.'))
  }, [boardPath, lessonId, mode])

  // Real-time sync: students poll the trainer's shared board; trainers auto-save debounced
  useEffect(() => {
    if (mode === 'trainer') return
    let cancelled = false
    const poll = async () => {
      try {
        const { data } = await api.get<{ data: { boardData?: BoardDocument; isLocked?: boolean; isShared?: boolean; revision?: number } }>(livePath)
        const result = data.data
        if (cancelled) return
        if (result.isShared && result.boardData?.elements) {
          setLive(true)
          if ((result.revision ?? 0) > lastRevision) {
            setBoard(result.boardData)
            setLastRevision(result.revision ?? 0)
          }
          setLocked(Boolean(result.isLocked))
        } else {
          setLive(false)
        }
      } catch { /* silent — board may not be shared yet */ }
    }
    poll()
    const id = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(id) }
  }, [livePath, mode, lastRevision])

  // Trainer auto-save (debounced) so students see changes in real time
  useEffect(() => {
    if (mode !== 'trainer' || !shared) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.put(boardPath, { boardData: boardRef.current })
      } catch { /* silent */ }
    }, 800)
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [board, boardPath, mode, shared])

  // Load students for individual board targeting
  useEffect(() => {
    if (mode !== 'trainer') return
    api.get<{ data: TrainerStudent[] }>('/trainer/students')
      .then(r => setStudents(r.data.data))
      .catch(() => {})
  }, [mode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    board.elements.forEach(element => drawElement(context, element))
    if (draft) drawElement(context, draft)
  }, [board, draft])

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * 960, y: ((event.clientY - rect.top) / rect.height) * 540 }
  }

  const commit = (next: BoardDocument) => {
    const trimmed = history.slice(0, historyIndex + 1)
    setBoard(next)
    setHistory([...trimmed, next])
    setHistoryIndex(trimmed.length)
  }

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (locked && mode === 'student') return
    const point = pointFromEvent(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    if (tool === 'text') {
      const text = window.prompt('Text for the board')
      if (text) commit({ version: 1, elements: [...board.elements, { id: crypto.randomUUID(), tool, start: point, end: point, text, color }] })
      return
    }
    setDraft(tool === 'pen' || tool === 'highlighter' || tool === 'eraser'
      ? { id: crypto.randomUUID(), tool, points: [point], color }
      : { id: crypto.randomUUID(), tool, start: point, end: point, color })
  }

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draft || (locked && mode === 'student')) return
    const point = pointFromEvent(event)
    setDraft(current => current?.points ? { ...current, points: [...current.points, point] } : current ? { ...current, end: point } : null)
  }

  const pointerUp = () => {
    if (draft) { commit({ version: 1, elements: [...board.elements, draft] }); setDraft(null) }
  }

  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setBoard(history[historyIndex - 1]) } }
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setBoard(history[historyIndex + 1]) } }

  const save = async () => {
    setSaving(true)
    setMessage('')
    try {
      if (mode === 'trainer') await api.put(boardPath, { boardData: board })
      else await dashboardService.saveBoard(lessonId, board)
      setMessage('Notes saved.')
    } catch {
      setMessage('Unable to save notes.')
    } finally {
      setSaving(false)
    }
  }

  const updateState = async (field: 'isShared' | 'isLocked', value: boolean) => {
    try {
      const response = await api.patch<{ data: { isShared: boolean; isLocked: boolean } }>(boardPath, { [field]: value })
      setLocked(response.data.data.isLocked)
      setShared(response.data.data.isShared)
      setMessage(field === 'isShared' ? (value ? 'Board shared with students.' : 'Board is private.') : (value ? 'Board locked.' : 'Board unlocked.'))
    } catch {
      setMessage('Unable to update board settings.')
    }
  }

  const updateBoardType = async (type: 'group' | 'individual', studentIds?: string[]) => {
    try {
      const response = await api.patch<{ data: { boardType: string; targetStudentIds: string[]; isShared: boolean } }>(boardPath, {
        boardType: type,
        targetStudentIds: studentIds ?? targetStudentIds,
        isShared: true,
      })
      setBoardType(response.data.data.boardType as 'group' | 'individual')
      setTargetStudentIds(response.data.data.targetStudentIds)
      setShared(response.data.data.isShared)
      setMessage(type === 'individual' ? 'Board shared with selected students only.' : 'Board shared with all students.')
    } catch {
      setMessage('Unable to update board sharing.')
    }
  }

  return (
    <section aria-labelledby="learning-board-title" className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="learning-board-title" className="font-semibold text-gray-900 dark:text-white">Interactive Learning Board</h2>
          <p className="text-xs text-gray-500">{mode === 'trainer' ? 'Prepare, share, and lock this board for your lesson.' : 'Your notes are stored securely for this lesson.'}</p>
        </div>
        <div className="flex gap-2">
          {mode === 'trainer' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => updateState('isShared', !shared)}>{shared ? 'Make Private' : 'Share'}</Button>
              <Button size="sm" variant="secondary" onClick={() => updateState('isLocked', !locked)}>{locked ? 'Unlock' : 'Lock'}</Button>
            </>
          )}
          <Button size="sm" onClick={save} loading={saving} disabled={locked && mode === 'student'}>
            <Save className="h-4 w-4" aria-hidden="true" />Save notes
          </Button>
        </div>
      </div>

      {mode === 'trainer' && (
        <div className="mb-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Share with:
            </span>
            <button type="button" onClick={() => updateBoardType('group')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', boardType === 'group' ? 'bg-teal text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}>
              Group (all students)
            </button>
            <button type="button" onClick={() => updateBoardType('individual')} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', boardType === 'individual' ? 'bg-teal text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')}>
              Individual (select)
            </button>
          </div>
          {boardType === 'individual' && (
            <div className="mt-2">
              <select
                multiple
                value={targetStudentIds}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => o.value)
                  setTargetStudentIds(selected)
                  updateBoardType('individual', selected)
                }}
                className="mt-1 h-28 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple students. Only selected students can see this board.</p>
            </div>
          )}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1" role="toolbar" aria-label="Learning board tools">
        {tools.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTool(id)} disabled={locked && mode === 'student'} title={label} aria-label={label} aria-pressed={tool === id} className={`rounded p-2 ${tool === id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <input aria-label="Drawing color" type="color" value={color} onChange={event => setColor(event.target.value)} disabled={locked && mode === 'student'} className="ml-1 h-8 w-9 rounded" />
        <button onClick={undo} disabled={(locked && mode === 'student') || historyIndex === 0} aria-label="Undo" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><Undo2 className="h-4 w-4" /></button>
        <button onClick={redo} disabled={(locked && mode === 'student') || historyIndex >= history.length - 1} aria-label="Redo" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><Redo2 className="h-4 w-4" /></button>
        <button onClick={() => commit(emptyBoard)} disabled={locked && mode === 'student'} aria-label="Clear board" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><RotateCcw className="h-4 w-4" /></button>
        <span className="ml-auto flex items-center gap-1">
          <button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(0.5, value - 0.1))} className="rounded p-2 text-gray-600 dark:text-gray-300"><ZoomOut className="h-4 w-4" /></button>
          <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
          <button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(1.5, value + 0.1))} className="rounded p-2 text-gray-600 dark:text-gray-300"><ZoomIn className="h-4 w-4" /></button>
        </span>
      </div>

      {live && mode === 'student' && (
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/20 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
          <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" /> Trainer is live — board updates in real time
        </p>
      )}
      {locked && <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">The trainer has locked this board for the current live class.</p>}
      {message && <p aria-live="polite" className="mb-2 text-xs text-gray-600 dark:text-gray-300">{message}</p>}
      <div className="overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700">
        <canvas ref={canvasRef} width={960} height={540} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Lesson drawing canvas" className="block touch-none" style={{ width: `${Math.round(100 * zoom)}%`, minWidth: '100%', cursor: locked ? 'not-allowed' : 'crosshair' }} />
      </div>
    </section>
  )
}