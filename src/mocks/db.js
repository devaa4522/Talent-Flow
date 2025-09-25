import Dexie from 'dexie'
export const db = new Dexie('talentflow')
db.version(1).stores({
  jobs: '++id, slug, status, order',
  candidates: '++id, email, stage, jobId',
  assessments: 'jobId'
})
