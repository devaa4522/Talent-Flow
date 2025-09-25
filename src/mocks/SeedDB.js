// src/mocks/seedDB.js
import { db } from './db.js';
import { __seeds } from './seeds';

// --- role mappings used to backfill old rows (derived from job.title) ---
const ROLE_DESC = {
  'Frontend Engineer': 'Build fast, accessible interfaces and UI systems that delight users across web & mobile.',
  'Backend Engineer': 'Design and operate resilient services and APIs that power product experiences at scale.',
  'Fullstack Engineer': 'Ship end-to-end product features across API, data, and polished UI surfaces.',
  'DevOps Engineer': 'Own build, deploy, and runtime reliability. Automate everything and keep it green.',
  'QA Engineer': 'Raise the quality bar with automation, exploratory testing, and crisp defect insights.',
  'Data Scientist': 'Turn raw data into product impact through modeling, experimentation, and clear narrative.',
  'ML Engineer': 'Productionize models, optimize inference, and build robust ML pipelines.',
  'Product Manager': 'Drive product outcomes with crisp strategy, execution, and cross-functional leadership.',
  'UI/UX Designer': 'Craft intuitive, elegant flows and design systems that scale.',
  'Support Engineer': 'Unblock customers, triage issues, and collaborate with eng for durable fixes.',
};

const ROLE_REQS = {
  'Frontend Engineer': [
    'Strong React or similar component model', 'TypeScript/ESNext proficiency',
    'Deep CSS fundamentals (layout, responsive, a11y)', 'Testing (RTL/Jest)',
    'Performance & web vitals awareness'
  ],
  'Backend Engineer': [
    'Node/Go/Java/Python in production', 'REST/GraphQL API design',
    'SQL & data modeling fundamentals', 'Observability (logs/metrics/traces)',
    'Security & reliability basics'
  ],
  'Fullstack Engineer': [
    'Comfortable across API + UI', 'React + one backend stack',
    'Database querying & schema design', 'Testing across layers',
    'End-to-end ownership mindset'
  ],
  'DevOps Engineer': [
    'CI/CD pipelines & release automation', 'Containers & orchestration (Docker/K8s)',
    'Infra as code (Terraform/Pulumi)', 'Monitoring/Alerting (Prom, Grafana, ELK)',
    'Cloud (AWS/GCP/Azure) fundamentals'
  ],
  'QA Engineer': [
    'Automation frameworks (Playwright/Cypress)', 'Exploratory testing discipline',
    'Clear bug reproduction & reporting', 'Test planning & risk analysis',
    'Build quality gates into CI'
  ],
  'Data Scientist': [
    'Statistical modeling & inference', 'Experiment design (A/B)',
    'SQL/Pandas proficiency', 'Data storytelling & visualization',
    'Python notebooks & production handoff'
  ],
  'ML Engineer': [
    'Model training & evaluation', 'Feature pipelines & data versioning',
    'Serving & inference optimization', 'GPU/accelerator awareness',
    'Monitoring for drift & performance'
  ],
  'Product Manager': [
    'Product strategy & roadmap clarity', 'User research & problem framing',
    'Spec writing & requirements grooming', 'Partner closely with Eng/Design',
    'Ship, measure, iterate'
  ],
  'UI/UX Designer': [
    'End-to-end UX from flows to pixels', 'Design systems & tokens',
    'Prototyping (Figma/Proto)', 'User testing & feedback synthesis',
    'Accessibility & inclusive design'
  ],
  'Support Engineer': [
    'Customer empathy & clear comms', 'Troubleshooting with logs/metrics',
    'Repro steps & minimal examples', 'Own escalations to closure',
    'Write help center content'
  ],
};

function baseRole(title = '') {
  // strip trailing Senior/Mid/Junior
  return String(title).replace(/\s+(Senior|Mid|Junior)\s*$/i, '').trim();
}
function seniorityHint(title = '') {
  if (/Senior/i.test(title)) return '5+ years; leads projects';
  if (/Mid/i.test(title))     return '2–4 years; ships reliably';
  return '0–2 years; eager to learn';
}

async function backfillDescriptionsAndReqs() {
  const jobs = await db.jobs.toArray();
  const toUpdate = jobs.filter(j =>
    !j.description || !String(j.description).trim() ||
    !Array.isArray(j.requirements) || j.requirements.length === 0
  );
  if (toUpdate.length === 0) return;

  await db.transaction('rw', db.jobs, async () => {
    for (const j of toUpdate) {
      const role = baseRole(j.title);
      const desc = ROLE_DESC[role] || 'Deliver product impact with quality and collaboration.';
      const reqs = ROLE_REQS[role]
        ? [seniorityHint(j.title), ...ROLE_REQS[role]]
        : ['3+ years experience','Ownership mindset','Good communication'];
      await db.jobs.update(j.id, { description: desc, requirements: reqs });
    }
  });
}

// Seeds when empty + always ensures fields exist for old databases
export async function seedDBIfEmpty() {
  await db.open();

  const jobCount = await db.jobs.count();
  if (jobCount === 0) {
    await db.transaction('rw', db.jobs, db.candidates, db.assessments, async () => {
      if (__seeds.jobs?.length)        await db.jobs.bulkAdd(__seeds.jobs);
      if (__seeds.candidates?.length)  await db.candidates.bulkAdd(__seeds.candidates);
      if (__seeds.assessments && typeof __seeds.assessments === 'object') {
        const rows = Object.entries(__seeds.assessments).map(([jobId, tpl]) => ({ jobId: Number(jobId), ...tpl }));
        if (rows.length) await db.assessments.bulkAdd(rows);
      }
    });
  }

  // ✅ ensure existing rows have description/requirements
  await backfillDescriptionsAndReqs();
}
