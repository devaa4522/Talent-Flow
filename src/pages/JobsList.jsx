import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../lib/api";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
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

function SortableRow({ job, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} onClick={onClick}>
      <td {...attributes} {...listeners} title="Drag to reorder" style={{ cursor: "grab", width: 28 }}>⋮⋮</td>
      <td style={{ color: "#94a3b8", fontSize: 12 }}>#{job.id}</td>
      <td>{job.title}</td>
      <td>{job.slug}</td>
      <td>
        {job.status === "active" ? (
          <span className="badge green">active</span>
        ) : (
          <span className="badge gray">archived</span>
        )}
      </td>
      <td>{Array.isArray(job.tags) ? job.tags.join(", ") : ""}</td>
    </tr>
  );
}

export default function JobsList() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const pageSize = Number(sp.get("pageSize") || 10);
  const status = (sp.get("status") || "all").toLowerCase();
  const q = sp.get("q") || "";

  const [data, setData] = React.useState({
    items: [],
    total: 0,
    page,
    pageSize,
  });
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    let active = true;
    API.listJobs({ page, pageSize, status, q })
      .then((d) => {
        if (!active) return;
        const next = {
          items: Array.isArray(d?.items) ? d.items : [],
          total: Number(d?.total || 0),
          page: Number(d?.page || page),
          pageSize: Number(d?.pageSize || pageSize),
        };
        setData(next);
        setItems(next.items);
      })
      .catch(() => {
        if (!active) return;
        setData({ items: [], total: 0, page, pageSize });
        setItems([]);
      });
    return () => {
      active = false;
    };
  }, [page, pageSize, status, q]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((j) => j.id === active.id);
    const newIndex = items.findIndex((j) => j.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const before = items;
    const optimistic = arrayMove(items, oldIndex, newIndex);
    setItems(optimistic);

    try {
      const full = await API.listJobs({ page: 1, pageSize: 1000, status, q });
      const ids = (full?.items || []).map((j) => j.id);
      const absOld = (page - 1) * pageSize + oldIndex;
      const absNew = (page - 1) * pageSize + newIndex;
      const reordered = arrayMove(ids, absOld, absNew);
      await API.reorderJobs(reordered);

      const refreshed = await API.listJobs({ page, pageSize, status, q });
      const next = {
        items: Array.isArray(refreshed?.items) ? refreshed.items : [],
        total: Number(refreshed?.total || 0),
        page: Number(refreshed?.page || page),
        pageSize: Number(refreshed?.pageSize || pageSize),
      };
      setData(next);
      setItems(next.items);
    } catch {
      setItems(before);
    }
  }

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || pageSize)));

  return (
    <section>
      <div className="page-header">
        <h3>Jobs</h3>
        <div className="row" style={{ gap: 8 }}>
          <select
            className="select"
            value={status}
            onChange={(e) =>
              setSp({ page: "1", pageSize: String(pageSize), status: e.target.value, q })
            }
            style={{ width: 160 }}
          >
            <option value="all">All</option>
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <input
            className="search"
            placeholder="Search jobs…"
            defaultValue={q}
            onChange={(e) => setSp({ page: "1", pageSize: String(pageSize), status, q: e.target.value })}
            style={{ width: 220 }}
          />
          <div className="right" />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 28 }} />
              <th style={{ width: 80 }}>ID</th>
              <th>Title</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Tags</th>
            </tr>
          </thead>
          <SortableContext items={items.map((j) => j.id)} strategy={verticalListSortingStrategy}>
            <tbody>
              {items.map((j) => (
                <SortableRow key={j.id} job={j} onClick={() => nav(`/jobs/${j.id}`)} />
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 20, color: "var(--muted)" }}>
                    No jobs
                  </td>
                </tr>
              )}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>

      <div className="row" style={{ justifyContent: "space-between", marginTop: 16 }}>
        <button
          className="btn ghost"
          onClick={() =>
            setSp({
              page: String(Math.max(1, page - 1)),
              pageSize: String(pageSize),
              status,
              q,
            })
          }
          disabled={page <= 1}
        >
          Prev
        </button>
        <div>
          Page {data.page} / {totalPages}
        </div>
        <button
          className="btn ghost"
          onClick={() =>
            setSp({
              page: String(page + 1),
              pageSize: String(pageSize),
              status,
              q,
            })
          }
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
}

