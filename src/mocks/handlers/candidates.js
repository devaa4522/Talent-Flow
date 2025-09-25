import { rest } from 'msw';
import { db } from '../db.js';
import { seedDBIfEmpty } from '../seedDB.js';
import { withLatency, maybeFailWrite } from './util.js';

// GET /candidates?page=&pageSize=&jobId=12&stages=applied,tech,offer
export const candidatesHandlers = [
  rest.get('/candidates', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const page = Number(req.url.searchParams.get('page') || 1);
    const pageSize = Number(req.url.searchParams.get('pageSize') || 50);
    const jobIdParam = req.url.searchParams.get('jobId');
    const stagesParam = req.url.searchParams.get('stages');

    const jobId = jobIdParam ? Number(jobIdParam) : 0;
    const stages = stagesParam ? new Set(stagesParam.split(',').map(s => s.trim().toLowerCase())) : null;

    let coll = jobId > 0
      ? db.candidates.where('jobId').equals(jobId)
      : db.candidates.toCollection();

    if (stages && stages.size) {
      coll = coll.filter(c => stages.has(String(c.stage || '').toLowerCase()));
    }

    const total = await coll.count();
    const items = await coll
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return res(ctx.json({ items, total }));
  }),

  // GET /candidates/:id
  rest.get('/candidates/:id', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const id = Number(req.params.id);
    const row = await db.candidates.get(id);
    if (!row) return res(ctx.status(404), ctx.json({ error: 'Candidate not found' }));
    return res(ctx.json(row));
  }),

  // PATCH /candidates/:id
  // Body may include: { jobId, stage, stageHistoryAppend?: {stage, at, note, mentions} }
  rest.patch('/candidates/:id', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const id = Number(req.params.id);
    const patch = await req.json();
    const cur = await db.candidates.get(id);
    if (!cur) return res(ctx.status(404), ctx.json({ error: 'Candidate not found' }));

    if (patch.stageHistoryAppend) {
      const prev = Array.isArray(cur.stageHistory) ? cur.stageHistory : [];
      patch.stageHistory = [...prev, patch.stageHistoryAppend];
      delete patch.stageHistoryAppend;
    }

    await db.candidates.update(id, patch);
    const row = await db.candidates.get(id);
    return res(ctx.json(row));
  }),
];
