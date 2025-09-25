import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../lib/api";

export default function JobEditor(){
  const { id } = useParams();
  const editing = Boolean(id);
  const [job, setJob] = React.useState({
    title:"", slug:"", tags:"", status:"active", description:"", requirements:""
  });
  const nav = useNavigate();

  React.useEffect(() => {
    if (editing) {
      API.getJob(id).then(j => setJob({
        ...j,
        tags:j.tags || "",
        requirements:(j.requirements || []).join("\n"),
      }));
    }
  }, [id, editing]);

  function save(){
    const payload = {
      ...job,
      tags: job.tags,
      requirements: (job.requirements || "").split("\n").map(s=>s.trim()).filter(Boolean),
    };
    API.updateJob(editing ? id : 0, payload).then(() => nav(`/jobs/${id}`));
  }

  return (
    <div className="grid2">
      <div className="card pad">
        <h2 style={{marginTop:0}}>Edit Job</h2>

        <label className="label">Title</label>
        <input className="input" value={job.title} onChange={e=>setJob({...job, title:e.target.value})}/>

        <label className="label">Slug</label>
        <input className="input" value={job.slug} onChange={e=>setJob({...job, slug:e.target.value})}/>

        <label className="label">Tags (comma separated)</label>
        <input className="input" value={job.tags} onChange={e=>setJob({...job, tags:e.target.value})}/>

        <label className="label">Status</label>
        <select className="select" value={job.status} onChange={e=>setJob({...job, status:e.target.value})}>
          <option value="active">active</option>
          <option value="archived">archived</option>
        </select>

        <label className="label">Description</label>
        <textarea className="textarea" value={job.description} onChange={e=>setJob({...job, description:e.target.value})}/>

        <label className="label">Requirements (one per line)</label>
        <textarea className="textarea" value={job.requirements} onChange={e=>setJob({...job, requirements:e.target.value})}/>

        <div className="row" style={{marginTop:12}}>
          <button className="btn ghost" onClick={()=>nav(-1)} style={{marginRight:8}}>Cancel</button>
          <button className="btn" onClick={save}>Save</button>
        </div>
      </div>

      <div className="card pad">
        <h3>Preview</h3>
        <h4 style={{margin:"6px 0"}}>{job.title}</h4>
        <div className="muted">Slug: {job.slug || "—"}</div>
        <div className="muted" style={{margin:"6px 0"}}>Tags: {job.tags || "—"}</div>
        <p>{job.description}</p>
        <h4>Requirements</h4>
        <ul>
          {(job.requirements || "").split("\n").map((r,i)=>r.trim() && <li key={i}>{r.trim()}</li>)}
        </ul>
      </div>
    </div>
  );
}
