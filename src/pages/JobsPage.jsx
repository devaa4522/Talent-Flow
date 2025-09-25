import React from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../lib/api";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PAGE_SIZE = 10;

function SortableRow({ job, onRowClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(job.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ width: 28 }}>
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          type="button"
          className="drag-handle"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
          aria-label={`Drag ${job.title}`}
        >
          ⋮⋮
        </button>
      </td>

      <td onClick={onRowClick} className="row-click">{job.title}</td>
      <td onClick={onRowClick} className="row-click">
        <span className="badge">{job.status}</span>
      </td>
      <td onClick={onRowClick} className="row-click">
        {(job.tags || []).join(", ")}
      </td>
    </tr>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = React.useState([]);      // full list
  const [page, setPage] = React.useState(1);       // 1-based
  const [showCreate, setShowCreate] = React.useState(false);
  const nav = useNavigate();

  // Load everything once; Dexie-backed API persists across reloads.
  React.useEffect(() => {
    API.get("/jobs?page=1&pageSize=5000").then((r) => setJobs(r.items || []));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const total = jobs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  const pageItems = React.useMemo(
    () => jobs.slice(startIndex, endIndex),
    [jobs, startIndex, endIndex]
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndexLocal = pageItems.findIndex((j) => String(j.id) === String(active.id));
    const newIndexLocal = pageItems.findIndex((j) => String(j.id) === String(over.id));
    if (oldIndexLocal < 0 || newIndexLocal < 0) return;

    // Translate page indices to global indices
    const oldIndexGlobal = startIndex + oldIndexLocal;
    const newIndexGlobal = startIndex + newIndexLocal;

    const before = jobs;
    const reordered = arrayMove(jobs, oldIndexGlobal, newIndexGlobal);
    setJobs(reordered);

    // Persist full order (recommended)
    API.reorderJobs(reordered.map((j) => j.id))
      .then(() =>
        API.get("/jobs?page=1&pageSize=5000").then((r) => setJobs(r.items || reordered))
      )
      .catch(() => setJobs(before));
  }

  function goto(p) {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
  }

  async function handleCreate(values) {
    const body = {
      title: values.title.trim(),
      status: values.status,
      tags: values.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const created = await API.post("/jobs", body); // returns created job with id
    if (created && created.id) {
      // Prepend locally (or refetch)
      setJobs((prev) => [created, ...prev]);
      setShowCreate(false);
      setPage(1);
      // nav(`/jobs/${created.id}`); // optional
    }
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Jobs</h3>
        <button className="button primary" onClick={() => setShowCreate(true)}>Create Job</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 28 }} />
              <th>Title</th>
              <th>Status</th>
              <th>Tags</th>
            </tr>
          </thead>

          <SortableContext
            items={pageItems.map((j) => String(j.id))}
            strategy={verticalListSortingStrategy}
          >
            <tbody>
              {pageItems.map((j) => (
                <SortableRow
                  key={j.id}
                  job={j}
                  onRowClick={() => nav(`/jobs/${j.id}`)}
                />
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 20, color: "var(--muted)" }}>
                    No jobs
                  </td>
                </tr>
              )}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>

      {/* Pagination controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <span className="small">
          Showing <b>{total === 0 ? 0 : startIndex + 1}</b>–<b>{endIndex}</b> of <b>{total}</b>
        </span>
        <div className="pager" style={{ display: "flex", gap: 8 }}>
          <button className="button" disabled={page === 1} onClick={() => goto(page - 1)}>‹</button>
          <span className="small" style={{ padding: "6px 8px" }}>
            Page {page} / {totalPages}
          </span>
          <button className="button" disabled={page === totalPages} onClick={() => goto(page + 1)}>›</button>
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreate && (
        <CreateJobModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Minimal CSS for the drag handle and modal; move to your stylesheet if you prefer */}
      <style>{`
        .drag-handle {
          cursor: grab;
          width: 100%;
          height: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 0;
          padding: 0;
          user-select: none;
          font-size: 16px;
          line-height: 1;
        }
        .drag-handle:active { cursor: grabbing; }
        .row-click { cursor: pointer; }
        .small { font-size: 12px; color: var(--muted, #666); }
        .button { padding: 6px 10px; border: 1px solid #ddd; background: #fff; border-radius: 6px; }
        .button.primary { background: #111827; color: #fff; border-color: #111827; }
        .button:disabled { opacity: .5; cursor: not-allowed; }

        /* Modal */
        .modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.25);
          display: flex; align-items: center; justify-content: center;
          z-index: 50;
        }
        .modal {
          background: #fff; border-radius: 12px; width: 520px; max-width: 95vw;
          border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0,0,0,.12);
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid #eee; }
        .modal-body { padding: 14px; display: grid; gap: 10px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 14px; border-top: 1px solid #eee; }
        .input { border: 1px solid #ddd; border-radius: 6px; padding: 8px; width: 100%; }
        .select { border: 1px solid #ddd; border-radius: 6px; padding: 8px; width: 100%; background: #fff; }
        label { font-size: 12px; color: #374151; }
      `}</style>
    </div>
  );
}

/* --------------- Modal Component --------------- */
function CreateJobModal({ onClose, onCreate }) {
  const [title, setTitle] = React.useState("");
  const [status, setStatus] = React.useState("active");
  const [tags, setTags] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!title.trim()) {
      setErr("Title is required.");
      return;
    }
    try {
      setSubmitting(true);
      await onCreate({ title, status, tags });
    } catch (e) {
      setErr("Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <h4 style={{ margin: 0 }}>Create Job</h4>
          <button className="button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div>
              <label>Title</label>
              <input
                className="input"
                placeholder="e.g. Backend Engineer Senior"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label>Status</label>
              <select
                className="select"
                value={status}
                onChange={(e)=>setStatus(e.target.value)}
              >
                <option value="active">active</option>
                <option value="archived">archived</option>
              </select>
            </div>

            <div>
              <label>Tags (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. remote, urgent"
                value={tags}
                onChange={(e)=>setTags(e.target.value)}
              />
            </div>

            {err && <div className="small" style={{ color: "#b91c1c" }}>{err}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
