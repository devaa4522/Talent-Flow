import React from 'react'
import { API } from '../lib/api'

export default function AssessmentPreview({ value, jobId }){
  if (!value) return null

  async function onSubmit(e){
    e.preventDefault()
    const form = e.currentTarget // keep a stable reference
    const fd = new FormData(form)

    // Build answers (supports multi-checkbox names like "name[]")
    const answers = {}
    for (const [k, v] of fd.entries()) {
      if (k.endsWith('[]')) {
        const base = k.slice(0, -2)
        if (!answers[base]) answers[base] = []
        answers[base].push(v)
      } else {
        answers[k] = v
      }
    }

    try {
      const res = await API.post(`/assessments/${jobId}/submit`, {
        title: value.title || '',
        sections: value.sections || [],
        answers,
        meta: {},
      })
      alert(`Submission saved (id: ${res.id})`)
      form.reset() // <— use the saved ref, not e.currentTarget
    } catch (err) {
      console.error(err)
      alert('Failed to submit. Please try again.')
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h4 style={{marginTop:0}}>{value.title || 'Untitled Assessment'}</h4>
      {(value.sections||[]).map((s,si)=>(
        <div key={si} style={{marginBottom:16}}>
          <div className="section-title">{s.title}</div>
          <div style={{marginTop:6}}>
            {(s.questions||[]).map((q,qi)=> <Question key={qi} q={q} name={`s${si}q${qi}`} /> )}
          </div>
        </div>
      ))}
      <hr className="sep"/>
      <button className="button primary" type="submit">Submit</button>
    </form>
  )
}

function Question({ q, name }){
  const label = <label style={{display:'block', fontWeight:500, marginBottom:6}}>{q.label}{q.required && <span className="small"> (required)</span>}</label>
  if(q.type==='short') return <div>{label}<input className="input" name={name}/></div>
  if(q.type==='long')  return <div>{label}<textarea className="input" name={name} rows={4}/></div>
  if(q.type==='single') return <div>{label}{(q.options||[]).map((o,i)=>(
    <label key={i} style={{display:'flex', gap:8, alignItems:'center', marginBottom:4}}><input type="radio" name={name} value={o}/> {o}</label>
  ))}</div>
  if(q.type==='multi') return <div>{label}{(q.options||[]).map((o,i)=>(
    <label key={i} style={{display:'flex', gap:8, alignItems:'center', marginBottom:4}}><input type="checkbox" name={name+'[]'} value={o}/> {o}</label>
  ))}</div>
  if(q.type==='number') return <div>{label}<input className="input" type="number" name={name} min={q.min??0} max={q.max??100}/></div>
  if(q.type==='file') return <div>{label}<input className="input" type="file" name={name}/></div>
  return <div>{label}<input className="input" name={name}/></div>
}
