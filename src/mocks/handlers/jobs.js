import { rest } from 'msw'
import { __seeds } from '../seeds.js'

let jobs = [...__seeds.jobs]

export const jobsHandlers = [
  rest.get('/jobs', (req, res, ctx)=>{
    const page = Number(req.url.searchParams.get('page')||1)
    const pageSize = Number(req.url.searchParams.get('pageSize')||10)
    const start = (page-1)*pageSize
    const items = jobs.slice(start, start+pageSize)
    return res(ctx.delay(300), ctx.json({ items, total: jobs.length }))
  }),
  rest.get('/jobs/:id', (req, res, ctx)=>{
    const j = jobs.find(x=>String(x.id)===req.params.id)
    if(!j) return res(ctx.status(404))
    return res(ctx.delay(200), ctx.json(j))
  }),
  rest.post('/jobs', async (req, res, ctx)=>{
    const body = await req.json()
    const maxOrder = jobs.reduce((m,j)=>Math.max(m,j.order),0)
    const id = (jobs.reduce((m,j)=>Math.max(m,j.id),0)+1)
    const next = { ...body, id, order: maxOrder+1 }
    jobs.push(next)
    return res(ctx.delay(300), ctx.json(next))
  }),
  rest.post('/jobs/reorder', async (req, res, ctx)=>{
    const body = await req.json() // { order: [ids...] }
    const byId = new Map(jobs.map(j=>[j.id, j]))
    jobs = body.order.map((id,idx)=>({ ...byId.get(id), order: idx+1 }))
    return res(ctx.delay(300), ctx.json({ ok:true }))
  })
]
