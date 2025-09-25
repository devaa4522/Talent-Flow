import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/api";

const mentionUsers = ["HR", "Recruiting", "Finance", "Design", "Ops"];
const extractMentions = (txt = "") => (txt.match(/@([A-Za-z0-9_-]+)/g) || []).map((s) => s.slice(1));

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [note, setNote] = useState("");
  const [sug, setSug] = useState([]);

  useEffect(() => {
    API.getCandidate(id).then((d) => {
      setC(d);
      setTimeline(Array.isArray(d.stageHistory) ? d.stageHistory : []);
    });
  }, [id]);

  function onChange(e) {
    const v = e.target.value;
    setNote(v);
    const at = v.lastIndexOf("@");
    if (at >= 0) {
      const q = v.slice(at + 1).toLowerCase();
      setSug(mentionUsers.filter((n) => n.toLowerCase().startsWith(q)).slice(0, 5));
    } else setSug([]);
  }

  function pick(name) {
    const at = note.lastIndexOf("@");
    setNote(note.slice(0, at + 1) + name + " " + note.slice(at + 1));
    setSug([]);
  }

  function add(e) {
    e.preventDefault();
    const mentions = extractMentions(note);
    setTimeline((tl) => [...tl, { stage: c.stage, at: new Date().toISOString(), note, mentions }]);
    setNote("");
  }

  if (!c) return <div className="card pad">Loading…</div>;

  return (
    <section>
      <div className="page-header">
        <h3>{c.name}</h3>
        <div className="right" />
      </div>

      <div className="grid2">
        <div className="card pad">
          <h4 style={{ marginTop: 0 }}>Profile</h4>
          <div className="row" style={{ gap: 8, marginBottom: 8 }}>
            <span className="badge gray">#{c.id}</span>
            <span className="badge">{c.stage}</span>
          </div>
          <div className="muted">{c.email}</div>
        </div>

        <div className="card pad">
          <h4 style={{ marginTop: 0 }}>Timeline</h4>
          <div>
            {[...timeline].reverse().map((e, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", marginBottom: 10 }}>
                <span className="badge gray" style={{ minWidth: 70 }}>
                  {new Date(e.at).toLocaleString()}
                </span>
                <div>
                  <div><strong>Stage:</strong> {e.stage}</div>
                  {e.note && <div className="muted" style={{ whiteSpace: "pre-wrap" }}>{e.note}</div>}
                  {Array.isArray(e.mentions) && e.mentions.length > 0 && (
                    <div className="muted" style={{ fontSize: 12 }}>Mentions: {e.mentions.join(", ")}</div>
                  )}
                </div>
              </div>
            ))}
            {timeline.length === 0 && <div className="muted">No timeline entries yet.</div>}
          </div>

          <form onSubmit={add} style={{ marginTop: 12 }}>
            <textarea
              className="textarea"
              placeholder="Add a note… use @ to mention"
              value={note}
              onChange={onChange}
            />
            {sug.length > 0 && (
              <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {sug.map((n) => (
                  <button key={n} type="button" className="btn ghost" onClick={() => pick(n)}>
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
