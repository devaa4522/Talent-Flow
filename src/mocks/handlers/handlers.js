import { http, HttpResponse } from "msw";
import { db, seed, STAGES } from "../db.js";

await seed();

const json = (data, status = 200) => HttpResponse.json(data, { status });

export const handlers = [
  // ------- Jobs -------
  http.get("/api/jobs", async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);
    const status = (url.searchParams.get("status") || "all").toLowerCase();
    const q = (url.searchParams.get("q") || "").toLowerCase();

    let all = await db.jobs.orderBy("order").toArray();
    if (status !== "all") all = all.filter(j => j.status === status);
    if (q) {
      all = all.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.slug.toLowerCase().includes(q) ||
        (j.tags || []).join(",").toLowerCase().includes(q)
      );
    }
    const total = all.length;
    const items = all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return json({ items, total, page, pageSize });
  }),

  http.get("/api/jobs/:id", async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return new HttpResponse("Bad id", { status: 400 });
    const job = await db.jobs.get(id);
    if (!job) return new HttpResponse("Job not found", { status: 404 });
    return json(job);
  }),

  http.post("/api/jobs", async ({ request }) => {
    const body = await request.json();
    const last = await db.jobs.orderBy("order").last();
    const id = await db.jobs.add({ ...body, order: (last?.order || 0) + 1 });
    return json(await db.jobs.get(id), 201);
  }),

  http.put("/api/jobs/:id", async ({ params, request }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return new HttpResponse("Bad id", { status: 400 });
    const patch = await request.json();
    await db.jobs.update(id, patch);
    return json(await db.jobs.get(id));
  }),

  http.post("/api/jobs/reorder", async ({ request }) => {
    const { order } = await request.json();
    if (!Array.isArray(order)) return new HttpResponse("Bad payload", { status: 400 });
    for (let i = 0; i < order.length; i++) {
      await db.jobs.update(order[i], { order: i + 1 });
    }
    return json({ ok: true });
  }),

  // ------- Candidates -------
  http.get("/api/stats/candidates", async () => {
    const total = await db.candidates.count();
    const perStage = {};
    for (const st of STAGES) perStage[st] = await db.candidates.where("stage").equals(st).count();
    return json({ total, perStage });
  }),

  http.get("/api/candidates", async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 20);
    const stage = url.searchParams.get("stage") || "Applied";
    const q = (url.searchParams.get("q") || "").toLowerCase();

    let all = await db.candidates.orderBy("id").toArray();
    if (stage && stage !== "All") all = all.filter(c => c.stage === stage);
    if (q) all = all.filter(c => (c.name + c.email).toLowerCase().includes(q));

    const total = all.length;
    const items = all.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return json({ page, pageSize, total, items });
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return new HttpResponse("Bad id", { status: 400 });
    const c = await db.candidates.get(id);
    if (!c) return new HttpResponse("Not found", { status: 404 });
    return json(c);
  }),

  http.post("/api/candidates/:id/move", async ({ params, request }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return new HttpResponse("Bad id", { status: 400 });
    const { toStage } = await request.json();
    if (!STAGES.includes(toStage)) return new HttpResponse("Invalid stage", { status: 400 });
    const c = await db.candidates.get(id);
    if (!c) return new HttpResponse("Not found", { status: 404 });
    const history = (c.stageHistory || []).concat([{ stage: toStage, at: Date.now() }]);
    await db.candidates.update(id, { stage: toStage, stageHistory: history });
    return json(await db.candidates.get(id));
  }),

  // ------- Assessments -------
  http.get("/api/assessments/:jobId", async ({ params }) => {
    const doc = await db.assessments.get(String(params.jobId));
    if (!doc) return new HttpResponse("Assessment not found", { status: 404 });
    return json(doc);
  }),

  http.put("/api/assessments/:jobId", async ({ params, request }) => {
    const body = await request.json();
    await db.assessments.put({ id: String(params.jobId), ...body });
    return json(await db.assessments.get(String(params.jobId)));
  }),

  http.post("/api/assessments/:jobId/submit", async ({ params, request }) => {
    const payload = await request.json();
    const id = await db.submissions.add({ jobId: Number(params.jobId), ...payload, createdAt: Date.now() });
    return json({ id });
  }),
];
