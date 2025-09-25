import { rest } from 'msw'
import { __seeds } from '../seeds.js'

export const statsHandlers = [
  rest.get('/stats', (req, res, ctx)=>{
    return res(ctx.json({ jobs: __seeds.jobs.length, candidates: __seeds.candidates.length, assessments: 5 }))
  })
]
