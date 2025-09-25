import { rest } from 'msw'
import { __seeds } from '../seeds.js'

let assessments = JSON.parse(JSON.stringify(__seeds.assessments))

export const assessmentsHandlers = [
  rest.get('/assessments/:jobId', (req, res, ctx)=>{
    const a = assessments[req.params.jobId] || { title:'New Assessment', sections:[] }
    return res(ctx.delay(200), ctx.json(a))
  }),
  rest.put('/assessments/:jobId', async (req, res, ctx)=>{
    const body = await req.json()
    assessments[req.params.jobId] = body
    return res(ctx.delay(300), ctx.json({ ok:true }))
  }),
  rest.post('/assessments/:jobId/submit', async (req, res, ctx)=>{
    const payload = await req.json()
    return res(ctx.delay(200), ctx.json({ ok:true }))
  })
]
