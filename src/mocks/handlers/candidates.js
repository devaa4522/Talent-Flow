import { rest } from 'msw'
import { __seeds } from '../seeds.js'

let candidates = [...__seeds.candidates]

export const candidatesHandlers = [
  rest.get('/candidates', (req, res, ctx)=>{
    const page = Number(req.url.searchParams.get('page')||1)
    const pageSize = 200
    const start = (page-1)*pageSize
    const items = candidates.slice(start, start+pageSize)
    return res(ctx.delay(300), ctx.json({ items, total: candidates.length }))
  }),
  rest.patch('/candidates/:id', async (req, res, ctx)=>{
    const body = await req.json()
    const id = Number(req.params.id)
    const idx = candidates.findIndex(c=>c.id===id)
    if(idx<0) return res(ctx.status(404))
    candidates[idx] = { ...candidates[idx], ...body }
    return res(ctx.delay(200), ctx.json(candidates[idx]))
  })
]
