import { rest } from 'msw';
import { db } from '../db.js';
import { seedDBIfEmpty } from '../seedDB.js';
import { withLatency, maybeFailWrite } from './util.js';

const slugify = (s) => String(s || '')
  .toLowerCase()
  .trim()
  .replace(/\s+/g, '-');

export const jobsHandlers = [
  // List (paged)
  rest.get('/jobs', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const page = Number(req.url.searchParams.get('page') || 1);
    const pageSize = Number(req.url.searchParams.get('pageSize') || 20);

    const total = await db.jobs.count();
    const items = await db.jobs
      .orderBy('order')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return res(ctx.json({ items, total }));
  }),

  // By ID
  rest.get('/jobs/:id', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const id = Number(req.params.id);
    const job = await db.jobs.get(id);
    if (!job) return res(ctx.status(404), ctx.json({ error: 'Job not found' }));
    return res(ctx.json(job));
  }),

  // Create
  rest.post('/jobs', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const body = await req.json();
    const title = String(body?.title || '').trim();
    if (!title) return res(ctx.status(400), ctx.json({ error: 'Title required' }));

    // choose next order
    const last = await db.jobs.orderBy('order').last();
    const order = (last?.order ?? 0) + 1;

    const row = {
      status: 'active',
      tags: Array.isArray(body?.tags) ? body.tags : [],
      description: body?.description || 'Role focusing on product delivery, quality, and collaboration.',
      requirements: Array.isArray(body?.requirements) && body.requirements.length
        ? body.requirements
        : ['3+ years experience', 'Ownership mindset', 'Good communication'],
      ...body,
      title,
      slug: slugify(title),
      order,
    };
    const id = await db.jobs.add(row);
    return res(ctx.json({ id, ...row }));
  }),

  // Update (partial)
  rest.patch('/jobs/:id', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const id = Number(req.params.id);
    const patch = await req.json();
    const cur = await db.jobs.get(id);
    if (!cur) return res(ctx.status(404), ctx.json({ error: 'Job not found' }));

    // auto-slug when title changes
    if (typeof patch.title === 'string') {
      patch.slug = slugify(patch.title);
    }
    // normalize tags/requirements
    if (patch.tags && !Array.isArray(patch.tags)) {
      patch.tags = [];
    }
    if (patch.requirements && !Array.isArray(patch.requirements)) {
      patch.requirements = [];
    }

    await db.jobs.update(id, patch);
    const job = await db.jobs.get(id);
    return res(ctx.json(job));
  }),

  // Delete
  rest.delete('/jobs/:id', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();
    if (maybeFailWrite()) return res(ctx.status(500), ctx.json({ error: 'Transient error, retry.' }));

    const id = Number(req.params.id);
    const existed = await db.jobs.get(id);
    if (!existed) return res(ctx.status(404), ctx.json({ error: 'Job not found' }));

    await db.jobs.delete(id);
    // (Optional) you could also null-out candidates.jobId here if you want.

    return res(ctx.json({ ok: true }));
  }),
];
