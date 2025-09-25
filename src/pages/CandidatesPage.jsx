import React from 'react'
import { API } from '../lib/api'
import SidePanelKanban,  { styles as kanbanStyles } from '../components/SidePanelKanban.jsx'
import { __seeds } from '../mocks/seeds'

export default function CandidatesPage(){
  const [cands,setCands] = React.useState([])
  React.useEffect(()=>{ API.get('/candidates?page=1').then(r=>setCands(r.items)) },[])
  // React.useEffect(() => { setItems(__seeds.candidates) }, [])
  return (
    <div className="card">
      <h3 style={{marginTop:0}}>Candidates</h3>
      <SidePanelKanban items={__seeds.candidates}/>
    </div>
  )
}
