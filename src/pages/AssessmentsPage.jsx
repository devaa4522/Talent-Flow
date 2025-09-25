// import React from 'react'
// import { useSearchParams } from 'react-router-dom'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { API } from '../lib/api'
// import AssessmentPreview from '../components/AssessmentPreview.jsx'

// export default function AssessmentsPage(){
//   const [params] = useSearchParams()
//   const jobId = params.get('jobId') || '1'
//   const {register, control, handleSubmit, watch, reset} = useForm({ defaultValues:{ title:'', sections:[] } })
//   const { fields, append, remove } = useFieldArray({ control, name: 'sections' })
//   const [saving,setSaving] = React.useState(false)

//   React.useEffect(()=>{
//     API.get(`/assessments/${jobId}`).then(a=>{ reset(a) })
//   },[jobId, reset])

//   const onSave = (data)=>{
//     setSaving(true)
//     API.put(`/assessments/${jobId}`, data).then(()=>setSaving(false))
//   }

//   return (
//     <div className="assess-layout">
//       <div className="card">
//         <h3 style={{marginTop:0}}>Assessment Builder</h3>
//         <div style={{display:'flex', gap:8, marginBottom:12}}>
//           <button className="button" onClick={()=>append({ title:'New Section', questions:[] })}>+ Add Section</button>
//           <button className="button primary" onClick={handleSubmit(onSave)} disabled={saving}>{saving?'Saving…':'Save'}</button>
//         </div>
//         <label>Title</label>
//         <input className="input" {...register('title')} placeholder="Assessment title"/>
//         <hr className="sep"/>
//         {fields.map((sec,idx)=>(
//           <div key={sec.id} className="card" style={{padding:12, marginBottom:12}}>
//             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//               <input className="input" {...register(`sections.${idx}.title`)} />
//               <button className="button" onClick={()=>remove(idx)}>Remove</button>
//             </div>
//             <SectionQuestions control={control} sectionIndex={idx}/>
//           </div>
//         ))}
//       </div>
//       <div>
//         <h3>Live Preview</h3>
//         <div className="preview-form">
//           <AssessmentPreview value={watch()}/>
//         </div>
//       </div>
//     </div>
//   )
// }

// function SectionQuestions({ control, sectionIndex }){
//   const name = `sections.${sectionIndex}.questions`
//   const { fields, append, remove } = useFieldArray({ control, name })
//   return (
//     <div>
//       <div style={{display:'flex', gap:8, margin:'8px 0 12px'}}>
//         <button className="button" onClick={()=>append({ type:'short', label:'Short answer', required:false })}>Short</button>
//         <button className="button" onClick={()=>append({ type:'long', label:'Long answer', required:false })}>Long</button>
//         <button className="button" onClick={()=>append({ type:'single', label:'Single choice', options:['Yes','No'], required:false })}>Single</button>
//         <button className="button" onClick={()=>append({ type:'multi', label:'Multiple choice', options:['A','B','C'], required:false })}>Multi</button>
//         <button className="button" onClick={()=>append({ type:'number', label:'Number', min:0, max:100, required:false })}>Number</button>
//         <button className="button" onClick={()=>append({ type:'file', label:'File upload', required:false })}>File</button>
//       </div>
//       {fields.map((q,qi)=>(
//         <div key={q.id} className="card" style={{padding:12, marginBottom:10}}>
//           <div className="grid cols-2">
//             <div>
//               <label>Label</label>
//               <input className="input" defaultValue={q.label} onChange={e=>q.label=e.target.value}/>
//             </div>
//             <div>
//               <label>Type</label>
//               <select className="input" defaultValue={q.type} onChange={e=>q.type=e.target.value}>
//                 <option value="short">Short</option>
//                 <option value="long">Long</option>
//                 <option value="single">Single</option>
//                 <option value="multi">Multi</option>
//                 <option value="number">Number</option>
//                 <option value="file">File</option>
//               </select>
//             </div>
//           </div>
//           {(q.type==='single'||q.type==='multi') && (
//             <div style={{marginTop:8}}>
//               <label>Options (comma separated)</label>
//               <input className="input" defaultValue={(q.options||[]).join(', ')} onChange={e=>q.options=e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}/>
//             </div>
//           )}
//           {q.type==='number' && (
//             <div className="grid cols-2" style={{marginTop:8}}>
//               <div><label>Min</label><input className="input" type="number" defaultValue={q.min??0} onChange={e=>q.min=Number(e.target.value)}/></div>
//               <div><label>Max</label><input className="input" type="number" defaultValue={q.max??100} onChange={e=>q.max=Number(e.target.value)}/></div>
//             </div>
//           )}
//           <div style={{display:'flex', gap:8, marginTop:8}}>
//             <label><input type="checkbox" defaultChecked={q.required} onChange={e=>q.required=e.target.checked}/> Required</label>
//             <button className="button" onClick={()=>remove(qi)}>Delete</button>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// import React from 'react'
// import { useSearchParams } from 'react-router-dom'
// import { useForm, useFieldArray } from 'react-hook-form'
// import { API } from '../lib/api'
// import AssessmentPreview from '../components/AssessmentPreview.jsx'

// export default function AssessmentsPage(){
//   const [params, setParams] = useSearchParams()
//   const jobId = params.get('jobId') || '1'

//   const { register, control, handleSubmit, watch, reset, setValue } = useForm({
//     defaultValues:{ title:'', sections:[] }
//   })
//   const { fields: sectionFields, append: appendSection, remove: removeSection } =
//     useFieldArray({ control, name: 'sections' })

//   const [saving, setSaving] = React.useState(false)

//   // --- Search bar state mirrors URL param
//   const [queryId, setQueryId] = React.useState(jobId)
//   React.useEffect(() => { setQueryId(jobId) }, [jobId])

//   // Load assessment when jobId changes
//   React.useEffect(() => {
//     let ignore = false
//     ;(async () => {
//       try {
//         const a = await API.get(`/assessments/${jobId}`)
//         if (ignore) return
//         // Fallback to empty template if API returns nothing usable
//         if (a && (a.title || a.sections)) reset(a)
//         else reset({ title: '', sections: [] })
//       } catch {
//         reset({ title: '', sections: [] })
//       }
//     })()
//     return () => { ignore = true }
//   }, [jobId, reset])

//   const onSave = async (data) => {
//     setSaving(true)
//     try {
//       const saved = await API.put(`/assessments/${jobId}`, data)
//       // If your API returns the saved doc, keep the form in sync:
//       if (saved && (saved.title || saved.sections)) reset(saved)
//     } finally {
//       setSaving(false)
//     }
//   }

//   function searchJob(e){
//     e?.preventDefault?.()
//     const trimmed = String(queryId || '').trim()
//     if(!trimmed || !/^\d+$/.test(trimmed)){
//       alert('Please enter a numeric Job ID')
//       return
//     }
//     const next = new URLSearchParams(params)
//     next.set('jobId', trimmed)
//     setParams(next, { replace: true })
//   }

//   return (
//     <div className="assess-layout">
//       <div className="card">
//         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
//           <h3 style={{marginTop:0}}>Assessment Builder</h3>

//           {/* Job ID search */}
//           <form onSubmit={searchJob} style={{display:'flex', gap:8}}>
//             <input
//               className="input"
//               style={{width:160}}
//               placeholder="Search Job ID…"
//               value={queryId}
//               onChange={e=>setQueryId(e.target.value)}
//               inputMode="numeric"
//               pattern="\d*"
//               aria-label="Job ID"
//             />
//             <button className="button" type="submit">Load</button>
//           </form>
//         </div>

//         <div style={{display:'flex', gap:8, margin:'8px 0 12px'}}>
//           <button
//             className="button"
//             onClick={()=>appendSection({ title:'New Section', questions:[] })}
//           >
//             + Add Section
//           </button>
//           <button
//             className="button primary"
//             onClick={handleSubmit(onSave)}
//             disabled={saving}
//           >
//             {saving ? 'Saving…' : 'Save'}
//           </button>
//         </div>

//         <label>Title</label>
//         <input className="input" {...register('title')} placeholder="Assessment title"/>

//         <hr className="sep"/>

//         {sectionFields.map((sec, idx)=>(
//           <div key={sec.id} className="card" style={{padding:12, marginBottom:12}}>
//             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', gap:8}}>
//               <input className="input" {...register(`sections.${idx}.title`)} />
//               <button className="button" onClick={()=>removeSection(idx)}>Remove</button>
//             </div>

//             <SectionQuestions
//               control={control}
//               sectionIndex={idx}
//               register={register}
//               setValue={setValue}
//               watch={watch}
//             />
//           </div>
//         ))}
//       </div>

//       <div>
//         <h3>Live Preview</h3>
//         <div className="preview-form">
//           <AssessmentPreview value={watch()}/>
//         </div>
//       </div>
//     </div>
//   )
// }

// function SectionQuestions({ control, sectionIndex, register, setValue, watch }){
//   const name = `sections.${sectionIndex}.questions`
//   const { fields, append, remove } = useFieldArray({ control, name })
//   const questions = watch(name) || [] // live values for conditional UI

//   return (
//     <div>
//       <div style={{display:'flex', gap:8, margin:'8px 0 12px'}}>
//         <button className="button" onClick={()=>append({ type:'short',  label:'Short answer',    required:false })}>Short</button>
//         <button className="button" onClick={()=>append({ type:'long',   label:'Long answer',     required:false })}>Long</button>
//         <button className="button" onClick={()=>append({ type:'single', label:'Single choice',   options:['Yes','No'], required:false })}>Single</button>
//         <button className="button" onClick={()=>append({ type:'multi',  label:'Multiple choice', options:['A','B','C'], required:false })}>Multi</button>
//         <button className="button" onClick={()=>append({ type:'number', label:'Number',          min:0, max:100, required:false })}>Number</button>
//         <button className="button" onClick={()=>append({ type:'file',   label:'File upload',     required:false })}>File</button>
//       </div>

//       {fields.map((q, qi) => {
//         const base = `sections.${sectionIndex}.questions.${qi}`
//         const qVal = questions[qi] || {}
//         const isChoice = qVal.type === 'single' || qVal.type === 'multi'

//         return (
//           <div key={q.id} className="card" style={{padding:12, marginBottom:10}}>
//             <div className="grid cols-2">
//               <div>
//                 <label>Label</label>
//                 <input className="input" {...register(`${base}.label`)} />
//               </div>
//               <div>
//                 <label>Type</label>
//                 <select className="input" {...register(`${base}.type`)}>
//                   <option value="short">Short</option>
//                   <option value="long">Long</option>
//                   <option value="single">Single</option>
//                   <option value="multi">Multi</option>
//                   <option value="number">Number</option>
//                   <option value="file">File</option>
//                 </select>
//               </div>
//             </div>

//             {isChoice && (
//               <div style={{marginTop:8}}>
//                 <label>Options (comma separated)</label>
//                 <input
//                   className="input"
//                   defaultValue={(qVal.options || []).join(', ')}
//                   onBlur={(e)=>{
//                     const arr = e.target.value
//                       .split(',')
//                       .map(s=>s.trim())
//                       .filter(Boolean)
//                     setValue(`${base}.options`, arr, { shouldDirty:true, shouldTouch:true })
//                   }}
//                   placeholder="e.g. Yes, No"
//                 />
//               </div>
//             )}

//             {qVal.type === 'number' && (
//               <div className="grid cols-2" style={{marginTop:8}}>
//                 <div>
//                   <label>Min</label>
//                   <input className="input" type="number" {...register(`${base}.min`, { valueAsNumber:true })}/>
//                 </div>
//                 <div>
//                   <label>Max</label>
//                   <input className="input" type="number" {...register(`${base}.max`, { valueAsNumber:true })}/>
//                 </div>
//               </div>
//             )}

//             <div style={{display:'flex', gap:8, marginTop:8, alignItems:'center'}}>
//               <label>
//                 <input type="checkbox" {...register(`${base}.required`)} /> Required
//               </label>
//               <button className="button" onClick={()=>remove(qi)}>Delete</button>
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }
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
    shouldUnregister: false, // keep array fields registered
  })

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection
  } = useFieldArray({ control, name: 'sections' })

  const [queryId, setQueryId] = React.useState(jobId)
  const [saveErr, setSaveErr] = React.useState('')
  const [loadErr, setLoadErr] = React.useState('')

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

  // Submit handler (now used by the <form onSubmit=...>)
  const onSave = async (data) => {
    setSaveErr('')
    try {
      const saved = await API.put(`/assessments/${jobId}`, data)
      // Prefer server response; if none, use our submitted data
      const next = (saved && (saved.sections || saved.title)) ? saved : data
      reset(next) // keep RHF state in sync with backend
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

  return (
    <div className="assess-layout">
      <form className="card" onSubmit={handleSubmit(onSave)}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{marginTop:0}}>Assessment Builder</h3>

          {/* Job ID search */}
          <form onSubmit={searchJob} style={{display:'flex', gap:8}}>
            <input
              className="input"
              style={{width:160}}
              placeholder="Search Job ID…"
              value={queryId}
              onChange={e=>setQueryId(e.target.value)}
              inputMode="numeric"
              pattern="\d*"
              aria-label="Job ID"
            />
            <button className="button" type="submit">Load</button>
          </form>
        </div>

        {loadErr && (
          <div className="callout error" style={{margin:'8px 0 0'}}>
            {loadErr}
          </div>
        )}

        <div style={{display:'flex', gap:8, margin:'8px 0 12px'}}>
          <button
            type="button"
            className="button"
            onClick={()=>appendSection({ title:'New Section', questions:[] })}
          >
            + Add Section
          </button>

          <button
            className="button primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving…' : 'Save'}
          </button>

          {!isSubmitting && isDirty && (
            <span className="small" style={{marginLeft:8}}>Unsaved changes</span>
          )}
        </div>

        {saveErr && (
          <div className="callout error" style={{margin:'0 0 8px'}}>
            {saveErr}
          </div>
        )}

        <label>Title</label>
        <input className="input" {...register('title')} placeholder="Assessment title"/>

        <hr className="sep"/>

        {sectionFields.map((sec, idx)=>(
          <div key={sec.id} className="card" style={{padding:12, marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', gap:8}}>
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

      <div>
        <h3>Live Preview</h3>
        <div className="preview-form">
          <AssessmentPreview value={watch()}/>
        </div>
      </div>

      {/* Minimal styles for messages */}
      <style>{`
        .callout.error { background:#fee2e2; border:1px solid #fecaca; color:#7f1d1d; padding:8px 10px; border-radius:8px; }
        .small { font-size: 12px; color: var(--muted, #666); }
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
                    // ensure RHF sees the change first
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
                        // keep it as text while typing
                        const raw = e.target.value
                        const arr = raw.split(',').map(s=>s.trim()).filter(Boolean)
                        onChange(arr) // store as array for submission
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
