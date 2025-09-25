import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const STAGES = ['applied','screen','tech','offer','hired','rejected'];
const mentionUsers = ["HR", "Recruiting", "Finance", "Design", "Ops"];
const extractMentions = (txt = "") => (txt.match(/@([A-Za-z0-9_-]+)/g) || []).map((s) => s.slice(1));

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [note, setNote] = useState("");
  const [sug, setSug] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // load candidate + jobs
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const cand = await fetch(`/candidates/${id}`).then(r => r.json());
        if (!ignore) setC(cand);
      } catch (e) { if (!ignore) setErr("Failed to load candidate."); }

      try {
        const j = await fetch(`/jobs?page=1&pageSize=1000`).then(r => r.json());
        if (!ignore) setJobs(j.items || []);
      } catch (e) { /* ignore */ }
    })();
    return () => { ignore = true; }
  }, [id]);

  const jobMap = useMemo(() => {
    const m = new Map();
    for (const j of jobs) m.set(j.id, j);
    return m;
  }, [jobs]);

  function onNoteChange(e) {
    const v = e.target.value;
    setNote(v);
    const at = v.lastIndexOf("@");
    if (at >= 0) {
      const q = v.slice(at + 1).toLowerCase();
      setSug(mentionUsers.filter(n => n.toLowerCase().startsWith(q)).slice(0, 5));
    } else {
      setSug([]);
    }
  }

  function pickMention(name) {
    const at = note.lastIndexOf("@");
    setNote(note.slice(0, at + 1) + name + " " + note.slice(at + 1));
    setSug([]);
  }

  async function saveBasics(patch) {
    setSaving(true); setErr("");
    try {
      const res = await fetch(`/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error('PATCH failed');
      const next = await res.json();
      setC(next);
    } catch (e) {
      setErr("Save failed. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangeJob(e) {
    const jobId = Number(e.target.value);
    if (!c) return;
    await saveBasics({ jobId });
  }

  async function onChangeStage(e) {
    const to = e.target.value;
    if (!c) return;
    const from = c.stage;
    const entry = {
      type: 'stage-change',
      from,
      to,
      at: new Date().toISOString(),
      note: 'Changed from editor',
      mentions: []
    };
    await saveBasics({ stage: to, stageHistoryAppend: entry });
  }


  async function addTimeline(e) {
    e.preventDefault();
    if (!c) return;
    const mentions = extractMentions(note);
    const entry = { stage: c.stage, at: new Date().toISOString(), note, mentions };
    setNote('');
    await saveBasics({ stageHistoryAppend: entry });
  }

  if (!c) return <div className="card pad">Loading…</div>;

  return (
    <section className="candidate-profile">
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{margin:0}}>{c.name}</h3>
        <div className="small muted">{c.email}</div>
      </div>

      {err && <div className="callout error" style={{marginBottom:8}}>{err}</div>}

      <div className="grid2">
        {/* Profile + assignment */}
        <div className="card pad">
          <h4 style={{ marginTop: 0 }}>Profile</h4>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span className="badge gray">#{c.id}</span>
            <span className="badge">{c.stage}</span>
          </div>

          <div className="grid cols-2" style={{gap:12}}>
            <div>
              <label className="small muted">Job</label>
              <select className="input" value={c.jobId} onChange={onChangeJob}>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            <div>
              <label className="small muted">Stage</label>
              <select className="input" value={c.stage} onChange={onChangeStage}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {saving && <div className="small muted" style={{marginTop:8}}>Saving…</div>}
        </div>

        {/* Timeline */}
        <div className="card pad">
          <h4 style={{ marginTop: 0 }}>Timeline</h4>
          <div className="timeline">
            {([...c.stageHistory || []]).reverse().map((e,i)=>(
              <div className="timeline-row" key={i}>
                <span className="ts">{new Date(e.at).toLocaleString()}</span>
                <div>
                  <div><strong>Stage:</strong> {e.stage}</div>
                  {e.note && <div className="muted" style={{whiteSpace:'pre-wrap'}}>{e.note}</div>}
                  {Array.isArray(e.mentions)&&e.mentions.length>0 && (
                    <div style={{marginTop:6, display:'flex', gap:6, flexWrap:'wrap'}}>
                      {e.mentions.map((m,idx)=>(<span className="mention-chip" key={idx}>@{m}</span>))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>


          <form onSubmit={addTimeline} style={{ marginTop: 12 }}>
            <textarea
              className="textarea"
              placeholder="Add a note… use @ to mention"
              value={note}
              onChange={onNoteChange}
            />
            {sug.length > 0 && (
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {sug.map((n) => (
                  <button key={n} type="button" className="btn ghost" onClick={() => pickMention(n)}>
                    @{n}
                  </button>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn">Add to timeline</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
