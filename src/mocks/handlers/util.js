// src/mocks/handlers/util.js
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function withLatency() {
  await sleep(randomBetween(200, 1200)); // 200–1200ms
}

export function maybeFailWrite() {
  const rate = randomBetween(5, 10); // 5–10%
  return Math.random() * 100 < rate;
}
