// src/lib/api.js
// Persistent mock API backed by Dexie (IndexedDB) with one-time seeding from __seeds.

import Dexie from 'dexie';
import { __seeds } from '../mocks/seeds';

// --- Dexie setup ---
const db = new Dexie('talentflow');
db.version(1).stores({
  jobs: '++id, slug, status, order',
  candidates: '++id, email, stage, jobId',
  assessments: 'jobId',
});
db.version(2).stores({
  submissions: '++id, jobId, createdAt',
});

// --- One-time seed (if DB is empty) ---
// NOTE: call this ONLY for routes that use IndexedDB (jobs, submissions)
async function initDBIfNeeded() {
  // Robust open: tolerate transient “blocked/upgrade” situations
  try {
    if (!db.isOpen()) await db.open();
  } catch (e) {
    // If another tab is upgrading, retry once after a micro delay
    await new Promise(r => setTimeout(r, 0));
    if (!db.isOpen()) await db.open();
  }

  const jobCount = await db.table('jobs').count();
  if (jobCount > 0) return; // already seeded

  await db.transaction('rw', db.jobs, db.candidates, db.assessments, async () => {
    const jobs = (__seeds.jobs || []).map((j, i) => ({
      ...j,
      order: j.order ?? i + 1,
    }));
    await db.jobs.bulkAdd(jobs);

    if (__seeds.candidates?.length) {
      await db.candidates.bulkAdd(__seeds.candidates);
    }

    if (__seeds.assessments && typeof __seeds.assessments === 'object') {
      const rows = Object.entries(__seeds.assessments).map(([jobId, tpl]) => ({
        jobId: Number(jobId),
        ...tpl,
      }));
      if (rows.length) await db.assessments.bulkAdd(rows);
    }
  });
}

// --- Helpers ---
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}
async function nextOrder() {
  const last = await db.jobs.orderBy('order').last();
  return (last?.order ?? 0) + 1;
}

// --- Network fallbacks (for non-mocked routes) ---
async function netGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function netSend(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// --- Route helpers ---
const isJobsId   = (p) => p.startsWith('/jobs/');
const isJobsList = (p) => p === '/jobs';
const isSubsList = (p) => /^\/assessments\/\d+\/submissions$/.test(p);
const isSubsItem = (p) => /^\/assessments\/\d+\/submissions\/\d+$/.test(p);
const isSubmit   = (p) => /^\/assessments\/\d+\/submit$/.test(p);

// --- Public API ---
export const API = {
  // GET:
  //   /jobs?page=&pageSize=
  //   /jobs/:id
  //   /assessments/:jobId/submissions
  //   /assessments/:jobId/submissions/:sid
  async get(url) {
    // Parse once
    let u;
    try { u = new URL(url, 'http://local'); } catch { /* ignore */ }

    // Routes served from IndexedDB
    if (u && (isJobsId(u.pathname) || isJobsList(u.pathname) || isSubsList(u.pathname) || isSubsItem(u.pathname))) {
      await initDBIfNeeded();

      if (isJobsId(u.pathname)) {
        const id = Number(u.pathname.split('/')[2]);
        if (Number.isNaN(id)) throw new Error('Invalid id');
        const job = await db.jobs.get(id);
        if (!job) throw new Error('Job not found');
        return job;
      }

      if (isJobsList(u.pathname)) {
        const page = Number(u.searchParams.get('page') || 1);
        const pageSize = Number(u.searchParams.get('pageSize') || 20);
        const total = await db.jobs.count();
        const items = await db.jobs
          .orderBy('order')
          .offset((page - 1) * pageSize)
          .limit(pageSize)
          .toArray();
        return { items, total };
      }

      if (isSubsList(u.pathname)) {
        const jobId = Number(u.pathname.split('/')[2]);
        const items = await db.submissions.where('jobId').equals(jobId).sortBy('createdAt');
        return { items: items.reverse() };
      }

      if (isSubsItem(u.pathname)) {
        const sid = Number(u.pathname.split('/')[4]);
        const row = await db.submissions.get(sid);
        if (!row) throw new Error('Submission not found');
        return row;
      }
    }

    // Everything else -> network/MSW (e.g., /assessments/:jobId)
    return netGet(url);
  },

  // POST:
  //   /jobs
  //   /assessments/:jobId/submit
  async post(url, body) {
    // Parse once
    let u;
    try { u = new URL(url, 'http://local'); } catch { /* ignore */ }

    if (url === '/jobs') {
      await initDBIfNeeded();
      const title = String(body?.title || '').trim();
      if (!title) throw new Error('Title is required');

      const job = {
        title,
        status: body?.status || 'active',
        tags: Array.isArray(body?.tags) ? body.tags : [],
        slug: slugify(title),
        order: await nextOrder(),
        description:
          body?.description ||
          'Role focusing on product delivery, quality, and collaboration.',
        requirements:
          body?.requirements || ['3+ years experience', 'Ownership mindset', 'Good communication'],
      };

      const id = await db.jobs.add(job);
      return { id, ...job };
    }

    if (u && isSubmit(u.pathname)) {
      await initDBIfNeeded();
      const jobId = Number(u.pathname.split('/')[2]);
      const payload = {
        jobId,
        createdAt: Date.now(),
        title: body?.title ?? '',
        sections: Array.isArray(body?.sections) ? body.sections : [],
        answers: body?.answers ?? {},
        meta: body?.meta ?? {},
      };
      const id = await db.submissions.add(payload);
      return { id, ok: true };
    }

    // Unknown -> network
    return netSend('POST', url, body);
  },

  async patch(url, body) {
    // only network-backed right now
    return netSend('PATCH', url, body);
  },

  async put(url, body) {
    // only network-backed right now
    return netSend('PUT', url, body);
  },

  async reorderJobs(orderedIds) {
    await initDBIfNeeded();
    const ids = (orderedIds || []).map((x) => Number(x));
    await db.transaction('rw', db.jobs, async () => {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        await db.jobs.update(id, { order: i + 1 });
      }
    });
    return { ok: true };
  },
    async delete(url) {
    await initDBIfNeeded();
    return netSend('DELETE', url);
  },

};
