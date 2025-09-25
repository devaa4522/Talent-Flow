import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { API } from '../lib/api'

export default function JobDetailPage(){
  const { id } = useParams()
  const nav = useNavigate()
  const [job,setJob] = React.useState(null)
  const [err,setErr] = React.useState('')
  const [busy,setBusy] = React.useState(false)

  React.useEffect(()=>{ API.get(`/jobs/${id}`).then(setJob).catch(()=>setErr('Failed to load')) },[id])

  async function onDelete(){
    if (!window.confirm('Delete this job? This cannot be undone.')) return
    setBusy(true); setErr('')
    try {
      await API.delete(`/jobs/${id}`)
      nav('/jobs')
    } catch (e) {
      console.error(e); setErr('Delete failed. Please retry.')
    } finally {
      setBusy(false)
    }
  }

  if(!job) return <div className="card">{err || 'Loading…'}</div>

  return (
    <div className="grid cols-2">
      <div className="card">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <h3 style={{marginTop:0}}>{job.title}</h3>
          <div className="row" style={{gap: 12}}>
            <Link className="button" to={`/jobs/${id}/edit`}>Edit</Link>
            <button className="button danger" onClick={onDelete} disabled={busy}>Delete</button>
          </div>

        </div>
        <p className="small">Slug: {job.slug}</p>
        <p><strong>Status:</strong> {job.status}</p>
        <p><strong>Tags:</strong> {(job.tags||[]).join(', ')}</p>
        <hr className="sep"/>
        <p><strong>Description</strong></p>
        <p>{job.description}</p>
        <hr className="sep"/>
        <p><strong>Requirements</strong></p>
        <ul>{(job.requirements||[]).map((r,i)=>(<li key={i}>{r}</li>))}</ul>
      </div>
      <div className="card">
        <h3>Assessment</h3>
        <p>Build or edit the assessment for this job.</p>
        <Link className="button primary" to={`/assessments?jobId=${job.id}`}>Build Assessment</Link>
      </div>

      <style>{`.button.danger{background:#fee2e2;border:1px solid #fecaca;color:#7f1d1d}`}</style>
    </div>
  )
}
