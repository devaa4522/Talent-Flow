import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { API } from '../lib/api'

export default function JobDetailPage(){
  const { id } = useParams()
  const [job,setJob] = React.useState(null)
  React.useEffect(()=>{ API.get(`/jobs/${id}`).then(setJob) },[id])
  if(!job) return <div className="card">Loading…</div>
  return (
    <div className="grid cols-2">
      <div className="card">
        <h3 style={{marginTop:0}}>{job.title}</h3>
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
    </div>
  )
}
