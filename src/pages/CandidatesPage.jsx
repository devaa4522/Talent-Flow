import React from 'react';
import SidePanelKanban from '../components/SidePanelKanban.jsx';

export default function CandidatesPage(){
  const [jobs, setJobs] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const [jobId, setJobId] = React.useState(0); // 0 = All jobs
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  // Load jobs once
  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/jobs?page=1&pageSize=1000').then(r => r.json());
        setJobs(r.items || []);
      } catch {}
    })();
  }, []);

  // Load candidates whenever jobId changes
  React.useEffect(() => { load(); }, [jobId]);

  function buildQuery() {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', '1000'); // grab a bunch
    if (jobId > 0) params.set('jobId', String(jobId));
    return params.toString();
  }

  async function load() {
    setLoading(true); setErr('');
    try {
      const qs = buildQuery();
      const r = await fetch(`/candidates?${qs}`).then(r => r.json());
      setItems(r.items || []);
    } catch (e) {
      console.error(e);
      setErr('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
        <h3 style={{marginTop:0}}>Candidates</h3>
        <div className="row" style={{gap:8, flexWrap:'wrap'}}>
          <select className="input" value={jobId} onChange={e=>setJobId(Number(e.target.value))}>
            <option value={0}>All jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <button className="button" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {err && <div className="callout error" style={{marginTop:8}}>{err}</div>}
      {!loading && items.length === 0 && <div className="small muted" style={{marginTop:8}}>No candidates.</div>}

      <div style={{marginTop:12}}>
        {/* Pass linkToProfile so cards link to /candidates/:id */}
        <SidePanelKanban items={items} linkToProfile />
      </div>
    </div>
  );
}
