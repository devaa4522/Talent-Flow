import React from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import TalentFlowPage from './pages/TalentFlowPage.jsx'
import JobsPage from './pages/JobsPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'
import CandidatesPage from './pages/CandidatesPage.jsx'
import AssessmentsPage from './pages/AssessmentsPage.jsx'
import CandidateProfilePage from './pages/CandidateProfilePage.jsx';
import JobEditor from './pages/JobEditor.jsx';

export default function App(){
  return (
    <BrowserRouter>
      <div className="container">
        <div className="header">
          <h1>TalentFlow</h1>
          <div className="nav">
            <NavLink to="/" end className={({isActive})=> isActive?'active':undefined}>Home</NavLink>
            <NavLink to="/jobs" className={({isActive})=> isActive?'active':undefined}>Jobs</NavLink>
            <NavLink to="/candidates" className={({isActive})=> isActive?'active':undefined}>Candidates</NavLink>
            <NavLink to="/assessments" className={({isActive})=> isActive?'active':undefined}>Assessments</NavLink>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<TalentFlowPage/>}/>
          <Route path="/jobs" element={<JobsPage/>}/>
          <Route path="/jobs/:id" element={<JobDetailPage/>}/>
          <Route path="/candidates" element={<CandidatesPage/>}/>
          <Route path="/assessments" element={<AssessmentsPage/>}/>
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/edit" element={<JobEditor />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
