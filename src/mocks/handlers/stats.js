import { rest } from 'msw';
import { db } from '../db.js';
import { seedDBIfEmpty } from '../seedDB.js';
import { withLatency } from './util.js';

export const statsHandlers = [
  rest.get('/stats', async (req, res, ctx) => {
    await seedDBIfEmpty();
    await withLatency();

    const jobs = await db.jobs.count();
    const candidates = await db.candidates.count();
    const assessments = await db.assessments.count();
    return res(ctx.json({ jobs, candidates, assessments }));
  }),
];
