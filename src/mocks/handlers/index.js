import { jobsHandlers } from './jobs.js'
import { candidatesHandlers } from './candidates.js'
import { assessmentsHandlers } from './assessments.js'
import { statsHandlers } from './stats.js'
export const handlers = [
  ...jobsHandlers, ...candidatesHandlers, ...assessmentsHandlers, ...statsHandlers
]
