import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { API } from '../lib/api'
import AssessmentPreview from '../components/AssessmentPreview.jsx'

export default function AssessmentsPage(){
  const [params, setParams] = useSearchParams()
  const jobId = params.get('jobId') || '1'

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, isDirty }
  } = useForm({
    defaultValues: { title:'', sections:[] },
    shouldUnregister: false,
  })

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection
  } = useFieldArray({ control, name: 'sections' })

  const [queryId, setQueryId] = React.useState(jobId)
  const [saveErr, setSaveErr] = React.useState('')
  const [loadErr, setLoadErr] = React.useState('')

  // submissions state
  const [subs, setSubs] = React.useState([])
  const [subsErr, setSubsErr] = React.useState('')
  const [subsLoading, setSubsLoading] = React.useState(false)

  React.useEffect(()=>{ setQueryId(jobId) },[jobId])

  // Load assessment when jobId changes
  React.useEffect(() => {
    let ignore = false
    setLoadErr('')
    ;(async () => {
      try {
        const a = await API.get(`/assessments/${jobId}`)
        if (ignore) return
        if (a && (Array.isArray(a.sections) || typeof a.title === 'string')) {
          reset(a)
        } else {
          reset({ title: '', sections: [] })
        }
      } catch (e) {
        setLoadErr('Could not load assessment for this Job ID.')
        reset({ title: '', sections: [] })
      }
    })()
    return () => { ignore = true }
  }, [jobId, reset])

  // Submit handler (used by the <form onSubmit=...>)
  const onSave = async (data) => {
    setSaveErr('')
    try {
      const saved = await API.put(`/assessments/${jobId}`, data)
      const next = (saved && (saved.sections || saved.title)) ? saved : data
      reset(next)
    } catch (e) {
      console.error(e)
      setSaveErr('Save failed. Please try again.')
    }
  }

  function searchJob(e){
    e?.preventDefault?.()
    const trimmed = String(queryId || '').trim()
    if(!trimmed || !/^\d+$/.test(trimmed)){
      alert('Please enter a numeric Job ID')
      return
    }
    const next = new URLSearchParams(params)
    next.set('jobId', trimmed)
    setParams(next, { replace: true })
  }

  async function loadSubmissions() {
    try {
      setSubsLoading(true); setSubsErr('')
      const r = await API.get(`/assessments/${jobId}/submissions`)
      setSubs(r.items || [])
    } catch (e) {
      console.error(e); setSubsErr('Failed to load submissions.')
    } finally {
      setSubsLoading(false)
    }
  }

  return (
    <div className="assess-layout">
      {/* Top bar: title + Job ID search (no nested forms!) */}
     <div className="assess-header">
    <h3 style={{margin:0}}>Assessment Builder</h3>

    <div style={{display:'flex', gap:8}}>
      <input
        className="input"
        style={{width:160}}
        placeholder="Search Job ID…"
        value={queryId}
        onChange={e=>setQueryId(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') searchJob(e) }}
        inputMode="numeric"
        pattern="\d*"
        aria-label="Job ID"
      />
      <button className="button" type="button" onClick={searchJob}>Load</button>
    </div>
  </div>

  {/* Two-column layout */}
  <div className="assess-shell">
    {/* LEFT: Builder */}
    <form className="card builder" onSubmit={handleSubmit(onSave)}>
      {loadErr && <div className="callout error" style={{margin:'8px 0 0'}}>{loadErr}</div>}

      <div className="builder-actions">
        <button type="button" className="button" onClick={()=>appendSection({ title:'New Section', questions:[] })}>+ Add Section</button>
        <button className="button primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save'}</button>
        {!isSubmitting && isDirty && <span className="small muted">Unsaved changes</span>}
      </div>

      {saveErr && <div className="callout error" style={{margin:'0 0 8px'}}>{saveErr}</div>}

      <label>Title</label>
      <input className="input" {...register('title')} placeholder="Assessment title"/>

      <hr className="sep"/>

      {sectionFields.map((sec, idx)=>(
        <div key={sec.id} className="card section">
          <div className="section-header">
            <input className="input" {...register(`sections.${idx}.title`)} />
            <button type="button" className="button" onClick={()=>removeSection(idx)}>Remove</button>
          </div>

          <SectionQuestions
            control={control}
            sectionIndex={idx}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        </div>
      ))}
    </form>

    {/* RIGHT: Preview + Submissions */}
    <aside className="assess-rail">
      <h3 className="rail-title">Live Preview</h3>
      <div className="preview-card">
        <AssessmentPreview value={watch()} jobId={jobId}/>
      </div>

      <div className="subs">
        <div className="subs-head">
          <h3>Submissions</h3>
          <button className="button" type="button" onClick={loadSubmissions}>
            {subsLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {subsErr && <div className="callout error">{subsErr}</div>}
        {!subsLoading && subs.length === 0 && <div className="small muted">No submissions yet.</div>}
        {subs.map(s => (
          <details key={s.id} className="subs-item">
            <summary>#{s.id} • {new Date(s.createdAt).toLocaleString()} • {s.title || 'Untitled'}</summary>
            <pre className="subs-json">{JSON.stringify(s.answers, null, 2)}</pre>
          </details>
        ))}
      </div>
    </aside>
  </div>



      {/* Styles */}
      <style>{`
        /* callouts + small text */
        .callout.error { background:#fee2e2; border:1px solid #fecaca; color:#7f1d1d; padding:8px 10px; border-radius:8px; }
        .small { font-size:12px; }
        .small.muted { color: var(--muted, #666); }

        /* Header row (title + search) kept tight */
        .assess-header{
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          gap:16px;
          margin: 0 0 6px;           /* minimal space under header */
        }

        /* Two-column grid: LEFT builder, RIGHT preview */
        .assess-shell{
          display:grid;
          grid-template-columns: minmax(640px, 1fr) 420px;
          gap:24px;
          align-items:start;
          margin-top:0;              /* sit right under header */
        }

        /* LEFT — builder */
        .builder{
          padding:14px;
          margin-top:-6px;           /* nudge up to align with preview */
        }
        .builder-actions{ display:flex; align-items:center; gap:10px; margin:8px 0 12px; }
        .section{ padding:12px; margin-bottom:12px; }
        .section-header{ display:flex; gap:8px; align-items:center; justify-content:space-between; margin-bottom:8px; }

        /* Ensure the first inner card doesn't add extra top space */
        .builder .card:first-child{ margin-top:0; }

        /* RIGHT — sticky preview rail */
        .assess-rail{
          position:sticky;
          top:0;                     /* align with header */
          align-self:start;
          height:fit-content;
        }
        .rail-title{ margin:0 0 6px 0; }
        .preview-card{
          background:#fff;
          border:1px solid rgba(0,0,0,0.08);
          border-radius:12px;
          padding:10px;              /* a bit tighter */
        }

        /* Submissions block */
        .subs{ margin-top:14px; }
        .subs-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .subs-item{ margin-top:8px; }
        .subs-json{ background:#f7f7f7; padding:8px; border-radius:8px; overflow:auto; margin-top:6px; }

        /* Responsive */
        @media (max-width:1100px){
          .assess-shell{ grid-template-columns:1fr; }
          .assess-rail{ position:static; }
        }

      `}</style>
    </div>
  )
}

function SectionQuestions({ control, sectionIndex, register, setValue, watch }){
  const name = `sections.${sectionIndex}.questions`
  const { fields, append, remove } = useFieldArray({ control, name })
  const questions = watch(name) || []

  return (
    <div>
      <div style={{display:'flex', gap:8, margin:'8px 0 12px'}}>
        <button type="button" className="button" onClick={()=>append({ type:'short',  label:'Short answer',    required:false })}>Short</button>
        <button type="button" className="button" onClick={()=>append({ type:'long',   label:'Long answer',     required:false })}>Long</button>
        <button type="button" className="button" onClick={()=>append({ type:'single', label:'Single choice',   options:['Yes','No'], required:false })}>Single</button>
        <button type="button" className="button" onClick={()=>append({ type:'multi',  label:'Multiple choice', options:['A','B','C'], required:false })}>Multi</button>
        <button type="button" className="button" onClick={()=>append({ type:'number', label:'Number',          min:0, max:100, required:false })}>Number</button>
        <button type="button" className="button" onClick={()=>append({ type:'file',   label:'File upload',     required:false })}>File</button>
      </div>

      {fields.map((f, qi) => {
        const base = `sections.${sectionIndex}.questions.${qi}`
        const qVal = questions[qi] || {}
        const isChoice = qVal.type === 'single' || qVal.type === 'multi'

        return (
          <div key={f.id} className="card" style={{padding:12, marginBottom:10}}>
            <div className="grid cols-2">
              <div>
                <label>Label</label>
                <input className="input" {...register(`${base}.label`)} />
              </div>
              <div>
                <label>Type</label>
                <select
                  className="input"
                  {...register(`${base}.type`)}
                  onChange={e => {
                    setValue(`${base}.type`, e.target.value, { shouldDirty:true, shouldTouch:true })
                  }}
                  value={qVal.type || 'short'}
                >
                  <option value="short">Short</option>
                  <option value="long">Long</option>
                  <option value="single">Single</option>
                  <option value="multi">Multi</option>
                  <option value="number">Number</option>
                  <option value="file">File</option>
                </select>
              </div>
            </div>

            {/* Options input bound through Controller to array<string> */}
            {isChoice && (
              <div style={{marginTop:8}}>
                <label>Options (comma separated)</label>
                <Controller
                  control={control}
                  name={`${base}.options`}
                  render={({ field: { value, onChange } }) => (
                    <input
                      className="input"
                      value={(Array.isArray(value) ? value : []).join(', ')}
                      onChange={(e)=>{
                        const raw = e.target.value
                        const arr = raw.split(',').map(s=>s.trim()).filter(Boolean)
                        onChange(arr)
                      }}
                      placeholder="e.g. Yes, No"
                    />
                  )}
                />
              </div>
            )}

            {qVal.type === 'number' && (
              <div className="grid cols-2" style={{marginTop:8}}>
                <div>
                  <label>Min</label>
                  <input className="input" type="number" {...register(`${base}.min`, { valueAsNumber:true })}/>
                </div>
                <div>
                  <label>Max</label>
                  <input className="input" type="number" {...register(`${base}.max`, { valueAsNumber:true })}/>
                </div>
              </div>
            )}

            <div style={{display:'flex', gap:8, marginTop:8, alignItems:'center'}}>
              <label>
                <input type="checkbox" {...register(`${base}.required`)} /> Required
              </label>
              <button type="button" className="button" onClick={()=>remove(qi)}>Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
