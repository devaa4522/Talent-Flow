import { rest } from 'msw';
import { db } from '../db.js';
import { seedDBIfEmpty } from '../seedDB.js';
import { withLatency, maybeFailWrite } from './util.js';

export const assessmentsHandlers = [
  // Load assessment by job
  rest.get('/assessments/:jobId', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const jobId = Number(req.params.jobId);
    const row = await db.assessments.get(jobId);
    return res(ctx.json(row || { title: 'New Assessment', sections: [] }));
  }),

  // Upsert assessment by job
  rest.put('/assessments/:jobId', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const jobId = Number(req.params.jobId);
    const body = await req.json();
    await db.assessments.put({ jobId, ...body });
    return res(ctx.json({ jobId, ...body }));
  }),

  // Submissions list
  rest.get('/assessments/:jobId/submissions', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const jobId = Number(req.params.jobId);
    const items = await db.submissions.where('jobId').equals(jobId).sortBy('createdAt');
    return res(ctx.json({ items: items.reverse() }));
  }),

  // Single submission
  rest.get('/assessments/:jobId/submissions/:sid', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const sid = Number(req.params.sid);
    const row = await db.submissions.get(sid);
    if (!row) return res(ctx.status(404), ctx.json({ error: 'Not found' }));
    return res(ctx.json(row));
  }),

  // Submit responses
  rest.post('/assessments/:jobId/submit', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const jobId = Number(req.params.jobId);
    const body = await req.json();
    const id = await db.submissions.add({
      jobId,
      createdAt: Date.now(),
      title: body?.title || '',
      sections: Array.isArray(body?.sections) ? body.sections : [],
      answers: body?.answers || {},
      meta: body?.meta || {},
    });
    return res(ctx.json({ id, ok: true }));
  }),
];
