import React from 'react'
import { Link } from 'react-router-dom';

import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useVirtualizer } from '@tanstack/react-virtual'
import { API } from '../lib/api'

/*
  Alternative approach: @tanstack/react-virtual (react-virtual) instead of react-window
  - Pros: auto-measure actual row heights via measureElement (handles dynamic card heights)
  - Smooth with thousands of rows
  - Right pane remains independently scrollable
*/

const STAGES = ['applied','screen','tech','offer','hired','rejected']

export default function SidePanelKanban({ items, linkToProfile = false }) {
  const [byStage, setByStage] = React.useState(() => group(items))
  React.useEffect(() => { setByStage(group(items)) }, [items])

  const [activeKey, setActiveKey] = React.useState('applied') // 'all' | stage

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const allItems = React.useMemo(
    () => STAGES.flatMap(s => (byStage[s] || []).map(c => ({ ...c, _stage: s })) ),
    [byStage]
  )

  const rightList = activeKey === 'all' ? allItems : (byStage[activeKey] || [])
  const rightListIds = rightList.map(c => c.id)
  const totalCount = React.useMemo(
    () => STAGES.reduce((acc, s) => acc + (byStage[s]?.length || 0), 0),
    [byStage]
  )

  // Scroll container ref for the right pane (independent scrollbar)
  const parentRef = React.useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: rightList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // px, rough estimate; real size measured below
    // This makes virtualization account for dynamic heights accurately
    measureElement: (el) => el?.getBoundingClientRect().height || 88,
    overscan: 8,
  })

  function handleDragEnd(e) {
    const { active, over } = e
    if (!over) return

    const candId = active.data.current?.candId
    if (!candId) return

    // Dropped on a chip => move stage + append timeline
    if (typeof over.id === 'string' && over.id.startsWith('chip::')) {
      const toStage = over.id.slice('chip::'.length)
      if (toStage === 'all') return
      setByStage(prev => {
        const currentStage = findStage(prev, candId)
        if (!currentStage || currentStage === toStage) return prev
        const src = [...prev[currentStage]]
        const idx = src.findIndex(c => c.id === candId)
        if (idx < 0) return prev
        const [moved] = src.splice(idx, 1)
        moved.stage = toStage
        const dst = [...prev[toStage]]
        dst.unshift(moved)

        // ✅ log stage-change in timeline (single line data)
        const entry = {
          type: 'stage-change',
          from: currentStage,
          to: toStage,
          at: new Date().toISOString(),
          note: 'Moved on Kanban',
          mentions: []
        }
        API.patch(`/candidates/${candId}`, {
          stage: toStage,
          stageHistoryAppend: entry
        }).catch(() => {})

        return { ...prev, [currentStage]: src, [toStage]: dst }
      })
      setActiveKey(toStage)
      return
    }



    // Within-list reorder (no persist in 'all')
    if (activeKey === 'all') return

    const overId = over.id
    if (!overId) return

    setByStage(prev => {
      const list = [...(prev[activeKey] || [])]
      const fromIndex = list.findIndex(c => c.id === candId)
      const toIndex = list.findIndex(c => c.id === overId)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev
      const reordered = arrayMove(list, fromIndex, toIndex)
      return { ...prev, [activeKey]: reordered }
    })
  }

  return (
    <div className="kb one-pane">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <aside className="sidebar">
          <ChipAll count={totalCount} active={activeKey === 'all'} onClick={() => setActiveKey('all')} />
          <div className="sidebar-sep" />
          <strong className="sidebar-title">Stages</strong>
          <div className="chips">
            {STAGES.map(s => (
              <ChipStage
                key={s}
                stage={s}
                count={(byStage[s] || []).length}
                active={activeKey === s}
                onClick={() => setActiveKey(s)}
              />
            ))}
          </div>
          <div className="small tip">Tip: drag a card onto a stage chip to move it.</div>
        </aside>

        <main className="pane">
          <div className="pane-head">
            <div className="pane-title">
              <span className="capitalize">{activeKey === 'all' ? 'All candidates' : activeKey}</span>
              <span className="badge">{rightList.length}</span>
            </div>
          </div>

          {/* Independently scrollable pane with @tanstack/react-virtual */}
          <div className="pane-scroll" ref={parentRef}>
            <SortableContext items={rightListIds} strategy={verticalListSortingStrategy}>
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  width: '100%',
                  position: 'relative'
                }}
              >
                {rowVirtualizer.getVirtualItems().map(vi => {
                  const c = rightList[vi.index]
                  return (
                    <div
                      key={c.id}
                      data-index={vi.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${vi.start}px)`
                      }}
                    >
                      <Row
                        c={c}
                        activeKey={activeKey}
                        currentStage={activeKey === 'all' ? c._stage : activeKey}
                        linkToProfile={linkToProfile}
                      />
                    </div>
                  )
                })}
              </div>
            </SortableContext>
          </div>
        </main>
      </DndContext>
    </div>
  )
}

/* ---------------- Sidebar chips ---------------- */
function ChipAll({ count, active, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'chip::all' })
  return (
    <div ref={setNodeRef} className={'chip all ' + (active ? 'active ' : '') + (isOver ? 'over ' : '')} onClick={onClick}>
      <div className="chip-line">
        <strong>All</strong>
        <span className="badge">{count}</span>
      </div>
      <div className="small">Click to show every candidate</div>
    </div>
  )
}

function ChipStage({ stage, count, active, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: `chip::${stage}` })
  return (
    <div ref={setNodeRef} onClick={onClick} className={'stage-chip chip ' + (active ? 'active ' : '') + (isOver ? 'over ' : '')}>
      <span className="capitalize">{stage}</span>
      <span className="badge">{count}</span>
    </div>
  )
}

/* ---------------- Row (virtual + sortable) ---------------- */
const Row = React.memo(function Row({ c, currentStage, activeKey, linkToProfile }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id, data: { candId: c.id } })
  const style = { transform: CSS.Transform.toString(transform), transition }

  // Make name clickable without triggering drag: stop mousedown/click bubbling
  const nameEl = linkToProfile ? (
    <Link
      to={`/candidates/${c.id}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {c.name}
    </Link>
  ) : (
    c.name
  )

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={'card-candidate' + (isDragging ? ' dragging' : '')}>
      <div className="card-top">
        <strong>{nameEl}</strong>
        <span className="small">{c.email}</span>
      </div>
      <div className="small" style={{ marginTop: 6 }}>
        Current stage:&nbsp;<b className="capitalize">{currentStage}</b>
        {activeKey === 'all' && currentStage !== c.stage ? (
          <span className="small" style={{ marginLeft: 8, opacity: 0.7 }}>(source: {c.stage})</span>
        ) : null}
      </div>
    </div>
  )
})

/* ---------------- helpers ---------------- */
function group(items) {
  const g = { applied: [], screen: [], tech: [], offer: [], hired: [], rejected: [] }
  for (const it of (items || [])) { (g[it.stage] || g.applied).push(it) }
  return g
}

function findStage(byStage, candId) {
  for (const s of STAGES) { if ((byStage[s] || []).some(c => c.id === candId)) return s }
  return null
}

/* ---------------- Minimal CSS ---------------- */
export const styles = `
.kb.one-pane{display:grid;grid-template-columns:280px 1fr;gap:16px;height:calc(100vh - 120px);min-height:480px}
.sidebar{border:1px solid #e6e6e6;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px;background:#fff;min-height:0}
.sidebar-title{font-weight:600;font-size:13px;opacity:.8}
.sidebar-sep{height:1px;background:#f0f0f0;margin:4px 0}
.chips{display:flex;flex-direction:column;gap:8px}
.tip{color:#666}
.chip{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:10px;border:1px solid #ececec;background:#fafafa;cursor:pointer;user-select:none}
.chip .badge{background:#efefef;border-radius:999px;padding:2px 8px;font-size:12px}
.chip.active{border-color:#c7d2fe;background:#eef2ff}
.chip.over{outline:2px dashed #93c5fd}
.chip.all{padding:10px}
.chip .chip-line{display:flex;width:100%;align-items:center;justify-content:space-between}
.pane{display:flex;flex-direction:column;border:1px solid #e6e6e6;border-radius:12px;background:#fff;min-height:0}
.pane-head{padding:12px 14px;border-bottom:1px solid #f0f0f0}
.pane-title{display:flex;gap:8px;align-items:center;font-weight:600}
.pane-title .capitalize{text-transform:capitalize}
.badge{background:#efefef;border-radius:999px;padding:2px 8px;font-size:12px}
.pane-scroll{overflow-y:auto;padding:12px;height:100%;min-height:0;position:relative}
.card-candidate{border:1px solid #ededed;border-radius:12px;padding:10px;background:#fff;margin-bottom:10px;box-shadow:0 0 0 rgba(0,0,0,0);transition:box-shadow .15s ease,transform .15s ease}
.card-candidate.dragging{box-shadow:0 6px 20px rgba(0,0,0,.08)}
.card-top{display:flex;justify-content:space-between;align-items:baseline}
.card-candidate a{color:inherit}
.small{font-size:12px;color:#555}
.capitalize{text-transform:capitalize}
`
