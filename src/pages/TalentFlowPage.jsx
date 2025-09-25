import React from 'react'
import { Link } from 'react-router-dom'
import { API } from '../lib/api'

export default function TalentFlowPage(){
  const [stats,setStats] = React.useState({jobs:0,candidates:0,assessments:0})
  React.useEffect(()=>{ API.get('/stats').then(setStats) },[])
  return (
    <div className="grid cols-3">
      <div className="card">
        <h3>Jobs</h3>
        <p className="small">Total jobs</p>
        <div style={{fontSize:28,fontWeight:700}}>{stats.jobs}</div>
        <div style={{marginTop:12}}><Link className="button" to="/jobs">View Jobs</Link></div>
      </div>
      <div className="card">
        <h3>Candidates</h3>
        <p className="small">Total candidates</p>
        <div style={{fontSize:28,fontWeight:700}}>{stats.candidates}</div>
        <div style={{marginTop:12}}><Link className="button" to="/candidates">View Candidates</Link></div>
      </div>
      <div className="card">
        <h3>Assessments</h3>
        <p className="small">Total assessments</p>
        <div style={{fontSize:28,fontWeight:700}}>{stats.assessments}</div>
        <div style={{marginTop:12}}><Link className="button" to="/assessments">Open Builder</Link></div>
      </div>
    </div>
  )
}
