import { useEffect, useRef, useState } from 'react'
import { Eraser, Highlighter, Minus, MousePointer2, Pencil, Redo2, RotateCcw, Save, Square, Type, Undo2, ZoomIn, ZoomOut } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { api } from '@/lib/axios'
import { Button } from '@/components/ui/Button'

type Tool = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'ellipse' | 'text'
type Point = { x: number; y: number }
type Element = { id: string; tool: Tool; points?: Point[]; start?: Point; end?: Point; text?: string; color: string }
type BoardDocument = { version: 1; elements: Element[] }
const emptyBoard: BoardDocument = { version: 1, elements: [] }
const tools: Array<{ id: Tool; label: string; Icon: typeof Pencil }> = [
  { id: 'pen', label: 'Pen', Icon: Pencil }, { id: 'highlighter', label: 'Highlighter', Icon: Highlighter }, { id: 'eraser', label: 'Eraser', Icon: Eraser },
  { id: 'rectangle', label: 'Rectangle', Icon: Square }, { id: 'ellipse', label: 'Ellipse', Icon: MousePointer2 }, { id: 'text', label: 'Text', Icon: Type },
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
    context.beginPath(); context.moveTo(element.points[0].x, element.points[0].y)
    element.points.slice(1).forEach(point => context.lineTo(point.x, point.y)); context.stroke()
  } else if (element.start && element.end) {
    const width = element.end.x - element.start.x; const height = element.end.y - element.start.y
    if (element.tool === 'ellipse') { context.beginPath(); context.ellipse(element.start.x + width / 2, element.start.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2); context.stroke() }
    else if (element.tool === 'text') { context.globalAlpha = 1; context.font = '18px sans-serif'; context.fillText(element.text ?? 'Text', element.start.x, element.start.y) }
    else context.strokeRect(element.start.x, element.start.y, width, height)
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
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const boardPath = `/boards/${mode === 'trainer' ? 'trainer/' : ''}lessons/${lessonId}`

  useEffect(() => { (mode === 'trainer' ? api.get<{ data: unknown }>(boardPath).then(response => response.data.data) : dashboardService.getBoard(lessonId)).then((data: unknown) => {
    const result = data as { boardData?: BoardDocument; isLocked?: boolean; isShared?: boolean }
    const loaded = result.boardData?.elements ? result.boardData : emptyBoard
    setBoard(loaded); setHistory([loaded]); setHistoryIndex(0); setLocked(Boolean(result.isLocked)); setShared(Boolean(result.isShared))
  }).catch(() => setMessage('Unable to load saved board notes.')) }, [boardPath, lessonId, mode])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const context = canvas.getContext('2d'); if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    board.elements.forEach(element => drawElement(context, element)); if (draft) drawElement(context, draft)
  }, [board, draft])

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * 960, y: ((event.clientY - rect.top) / rect.height) * 540 }
  }
  const commit = (next: BoardDocument) => { const trimmed = history.slice(0, historyIndex + 1); setBoard(next); setHistory([...trimmed, next]); setHistoryIndex(trimmed.length) }
  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (locked && mode === 'student') return
    const point = pointFromEvent(event); event.currentTarget.setPointerCapture(event.pointerId)
    if (tool === 'text') { const text = window.prompt('Text for the board'); if (text) commit({ version: 1, elements: [...board.elements, { id: crypto.randomUUID(), tool, start: point, end: point, text, color }] }); return }
    setDraft(tool === 'pen' || tool === 'highlighter' || tool === 'eraser' ? { id: crypto.randomUUID(), tool, points: [point], color } : { id: crypto.randomUUID(), tool, start: point, end: point, color })
  }
  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draft || (locked && mode === 'student')) return
    const point = pointFromEvent(event)
    setDraft(current => current?.points ? { ...current, points: [...current.points, point] } : current ? { ...current, end: point } : null)
  }
  const pointerUp = () => { if (draft) { commit({ version: 1, elements: [...board.elements, draft] }); setDraft(null) } }
  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setBoard(history[historyIndex - 1]) } }
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setBoard(history[historyIndex + 1]) } }
  const save = async () => { setSaving(true); setMessage(''); try { if (mode === 'trainer') await api.put(boardPath, { boardData: board }); else await dashboardService.saveBoard(lessonId, board); setMessage('Notes saved.') } catch { setMessage('Unable to save notes.') } finally { setSaving(false) } }
  const updateState = async (field: 'isShared' | 'isLocked', value: boolean) => { try { const response = await api.patch<{ data: { isShared: boolean; isLocked: boolean } }>(boardPath, { [field]: value }); setLocked(response.data.data.isLocked); setShared(response.data.data.isShared); setMessage(field === 'isShared' ? (value ? 'Board shared with students.' : 'Board is private.') : (value ? 'Board locked.' : 'Board unlocked.')) } catch { setMessage('Unable to update board settings.') } }

  return <section aria-labelledby="learning-board-title" className="mb-8 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-surface-dark">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 id="learning-board-title" className="font-semibold text-gray-900 dark:text-white">Interactive Learning Board</h2><p className="text-xs text-gray-500">{mode === 'trainer' ? 'Prepare, share, and lock this board for your lesson.' : 'Your notes are stored securely for this lesson.'}</p></div><div className="flex gap-2">{mode === 'trainer' && <><Button size="sm" variant="secondary" onClick={() => updateState('isShared', !shared)}>{shared ? 'Make Private' : 'Share'}</Button><Button size="sm" variant="secondary" onClick={() => updateState('isLocked', !locked)}>{locked ? 'Unlock' : 'Lock'}</Button></>}<Button size="sm" onClick={save} loading={saving} disabled={locked && mode === 'student'}><Save className="h-4 w-4" aria-hidden="true" />Save notes</Button></div></div>
    <div className="mb-3 flex flex-wrap items-center gap-1" role="toolbar" aria-label="Learning board tools">
      {tools.map(({ id, label, Icon }) => <button key={id} onClick={() => setTool(id)} disabled={locked && mode === 'student'} title={label} aria-label={label} aria-pressed={tool === id} className={`rounded p-2 ${tool === id ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}><Icon className="h-4 w-4" /></button>)}
      <input aria-label="Drawing color" type="color" value={color} onChange={event => setColor(event.target.value)} disabled={locked && mode === 'student'} className="ml-1 h-8 w-9 rounded" />
      <button onClick={undo} disabled={(locked && mode === 'student') || historyIndex === 0} aria-label="Undo" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><Undo2 className="h-4 w-4" /></button><button onClick={redo} disabled={(locked && mode === 'student') || historyIndex >= history.length - 1} aria-label="Redo" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><Redo2 className="h-4 w-4" /></button>
      <button onClick={() => commit(emptyBoard)} disabled={locked && mode === 'student'} aria-label="Clear board" className="rounded p-2 text-gray-600 disabled:opacity-40 dark:text-gray-300"><RotateCcw className="h-4 w-4" /></button>
      <span className="ml-auto flex items-center gap-1"><button aria-label="Zoom out" onClick={() => setZoom(value => Math.max(0.5, value - 0.1))} className="rounded p-2 text-gray-600 dark:text-gray-300"><ZoomOut className="h-4 w-4" /></button><span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => setZoom(value => Math.min(1.5, value + 0.1))} className="rounded p-2 text-gray-600 dark:text-gray-300"><ZoomIn className="h-4 w-4" /></button></span>
    </div>
    {locked && <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">The trainer has locked this board for the current live class.</p>}
    {message && <p aria-live="polite" className="mb-2 text-xs text-gray-600 dark:text-gray-300">{message}</p>}
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700"><canvas ref={canvasRef} width={960} height={540} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Lesson drawing canvas" className="block touch-none" style={{ width: `${Math.round(100 * zoom)}%`, minWidth: '100%', cursor: locked ? 'not-allowed' : 'crosshair' }} /></div>
  </section>
}
