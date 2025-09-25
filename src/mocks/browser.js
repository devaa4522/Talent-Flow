import { setupWorker } from 'msw'
import { handlers } from './handlers/index.js'
export const worker = setupWorker(...handlers)
worker.start({ onUnhandledRequest: 'bypass' })
