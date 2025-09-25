import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API } from '../lib/api';

export default function JobEditor(){
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = React.useState({
    title: '',
    status: 'active',
    tags: [],
    description: '',
    requirements: []
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const job = await API.get(`/jobs/${id}`);
        if (!ignore) {
          setForm({
            title: job.title || '',
            status: job.status || 'active',
            tags: Array.isArray(job.tags) ? job.tags : [],
            description: job.description || '',
            requirements: Array.isArray(job.requirements) ? job.requirements : [],
          });
          setLoading(false);
        }
      } catch (e) {
        if (!ignore) { setErr('Failed to load job'); setLoading(false); }
      }
    })();
    return () => { ignore = true; }
  }, [id]);

  function setField(key, val){
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function save(e){
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const payload = {
        title: form.title.trim(),
        status: form.status,
        tags: form.tags.map(s => String(s).trim()).filter(Boolean),
        description: form.description,
        requirements: form.requirements.map(s => String(s).trim()).filter(Boolean),
      };
      await API.patch(`/jobs/${id}`, payload);
      nav(`/jobs/${id}`);
    } catch (e) {
      console.error(e);
      setErr('Save failed. Please retry.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(){
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    setSaving(true); setErr('');
    try {
      await API.delete(`/jobs/${id}`);
      nav('/jobs');
    } catch (e) {
      console.error(e);
      setErr('Delete failed. Please retry.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card">Loading…</div>;

  return (
    <div className="card">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
        <h3 style={{marginTop:0}}>Edit Job</h3>
        <div className="row" style={{gap: 16}}>
          <Link className="button" to={`/jobs/${id}`}>Cancel</Link>
          <button className="button danger" onClick={onDelete} disabled={saving}>Delete</button>
          <button className="button primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      {err && <div className="callout error" style={{marginTop:8}}>{err}</div>}

      <form onSubmit={save} style={{marginTop:12}}>
        <label>Title</label>
        <input className="input" value={form.title} onChange={e => setField('title', e.target.value)} />

        <div className="grid cols-2" style={{gap:12, marginTop:8}}>
          <div>
            <label>Status</label>
            <select className="input" value={form.status} onChange={e=>setField('status', e.target.value)}>
              <option value="active">active</option>
              <option value="archived">archived</option>
            </select>
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input
              className="input"
              value={form.tags.join(', ')}
              onChange={e => setField('tags', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))}
              placeholder="e.g. remote, urgent"
            />
          </div>
        </div>

        <label style={{marginTop:8}}>Description</label>
        <textarea className="input" rows={4} value={form.description} onChange={e=>setField('description', e.target.value)} />

        <label style={{marginTop:8}}>Requirements (one per line)</label>
        <textarea
          className="input"
          rows={5}
          value={form.requirements.join('\n')}
          onChange={e=>setField('requirements', e.target.value.split('\n'))}
        />

        <div style={{marginTop:12}}>
          <button className="button primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>

      <style>{`
        .button.danger { background:#fee2e2; border:1px solid #fecaca; color:#7f1d1d; }
        textarea.input { resize: vertical; }
      `}</style>
    </div>
  );
}
