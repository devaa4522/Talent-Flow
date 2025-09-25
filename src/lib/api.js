import { __seeds } from '../mocks/seeds'

export const API = {
  async get(url){
    const r = await fetch(url)
    if(!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },
  async post(url, body){
    const r = await fetch(url,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
    if(!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },
  async patch(url, body){
    const r = await fetch(url,{ method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
    if(!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },
  async put(url, body){
    const r = await fetch(url,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body)})
    if(!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  },
  //  async patch(url, body = {}) {
  //   const m = url.match(/^\/candidates\/(\d+)$/)
  //   if (!m) throw new Error('Unsupported URL: ' + url)
  //   const id = Number(m[1])

  //   const idx = __seeds.candidates.findIndex(c => c.id === id)
  //   if (idx === -1) throw new Error('Candidate not found: ' + id)

  //   const updated = { ...__seeds.candidates[idx], ...body }
  //   __seeds.candidates[idx] = updated

  //   return { ok: true, data: updated }
  // },

  // (optional) fetch all candidates
  // async get(url) {
  //   if (url === '/candidates') {
  //     return { ok: true, data: __seeds.candidates.slice() }
  //   }
  //   throw new Error('Unsupported URL: ' + url)
  // }
}
