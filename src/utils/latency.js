export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function withLatency(fn, min=200, max=1200) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await wait(delay);
  return fn();
}
export function shouldFail(rate=0.08) {
  return Math.random() < rate;
}
