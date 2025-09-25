// src/db.js
import Dexie from 'dexie';

class TalentflowDB extends Dexie {
  constructor() {
    super('talentflow');
    this.version(1).stores({
      jobs: '++id, slug, status, order',
      candidates: '++id, email, stage, jobId',
      assessments: 'jobId',
    });
    this.version(2).stores({
      submissions: '++id, jobId, createdAt',
    });
  }
}

export const db = new TalentflowDB();
