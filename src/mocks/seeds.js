// src/mocks/seeds.js
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];

const TITLES = [
  'Frontend Engineer','Backend Engineer','Fullstack Engineer','DevOps Engineer','QA Engineer',
  'Data Scientist','ML Engineer','Product Manager','UI/UX Designer','Support Engineer'
];
const TAGS = ['remote','hybrid','onsite','contract','full-time','urgent','senior','junior'];
const STAGES = ['applied','screen','tech','offer','hired','rejected'];
const FIRST = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Sai','Krishna','Ishaan','Kabir','Rohan','Dev','Shreya','Aisha','Ananya','Aarohi','Diya','Ira','Ishita','Kavya','Kiara','Meera','Navya','Riya','Saanvi','Sara','Trisha','Yash','Tanvi','Nikhil','Aditi','Nisha','Sahil','Rakesh','Pranav','Anita','Neha','Karthik','Harsh','Pooja','Sneha','Aman'];
const LAST = ['Sharma','Verma','Gupta','Iyer','Reddy','Menon','Patel','Khan','Singh','Das','Rao','Mehta','Agarwal','Bose','Mukherjee','Joshi','Bhat','Shetty','Desai','Kapoor','Malhotra','Banerjee','Ghosh','Kulkarni','Naidu','Pandey','Tripathi','Tiwari','Yadav'];

/* Role-specific descriptions & requirement templates */
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
  'Support Engineer': 'Unblock customers, triage issues, and collaborate with eng for durable fixes.'
};

const ROLE_REQS = {
  'Frontend Engineer': [
    'Strong React or similar component model', 'TypeScript/ESNext proficiency',
    'Deep CSS fundamentals (layout, responsive, a11y)', 'Testing (RTL/Jest), quality mindset',
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
    'Statistical modeling & inference', 'Experiment design (A/B, CUPED)',
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
    'Customer empathy & clear comms', 'Troubleshooting & logs/metrics basics',
    'Repro steps & minimal examples', 'Own escalations to closure',
    'Write help center content'
  ]
};

function titleAt(i) {
  const base = TITLES[i % TITLES.length];
  const seniority = i % 3 === 0 ? 'Senior' : i % 3 === 1 ? 'Mid' : 'Junior';
  return `${base} ${seniority}`;
}

function seniorityPrefix(i) {
  return i % 3 === 0 ? '5+ years; leads projects' :
         i % 3 === 1 ? '2–4 years; ships reliably' :
                       '0–2 years; eager to learn';
}

function genJobs() {
  const jobs = [];
  for (let i = 1; i <= 25; i++) {
    const fullTitle = titleAt(i);
    const baseRole = fullTitle.replace(/\s+(Senior|Mid|Junior)$/, '');
    const desc = ROLE_DESC[baseRole] || 'Deliver product impact with quality and collaboration.';
    const reqs = [...(ROLE_REQS[baseRole] || ['Strong fundamentals', 'Ownership mindset'])];

    // Prepend seniority guide
    reqs.unshift(seniorityPrefix(i));

    jobs.push({
      id: i,
      title: fullTitle,
      slug: fullTitle.toLowerCase().replace(/\s+/g, '-'),
      status: i % 3 === 0 ? 'archived' : 'active',
      tags: Array.from(new Set([pick(TAGS), pick(TAGS)])).slice(0, 2),
      description: desc,
      requirements: reqs,
      order: i
    });
  }
  return jobs;
}

function genCandidates() {
  let id = 1;
  const total = 1000;
  const out = [];
  for (let i = 0; i < total; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const email = name.toLowerCase().replace(/\s+/g, '.') + '@example.com';
    out.push({
      id: id++,
      name,
      email,
      stage: pick(STAGES),
      jobId: (i % 25) + 1
    });
  }
  return out;
}

function makeSection(title, qs) { return { title, questions: qs }; }
function qShort(label, required = false) { return ({ type: 'short', label, required }); }
function qLong(label, required = false) { return ({ type: 'long', label, required }); }
function qSingle(label, options, required = false) { return ({ type: 'single', label, options, required }); }
function qMulti(label, options, required = false) { return ({ type: 'multi', label, options, required }); }
function qNum(label, min = 0, max = 40, required = false) { return ({ type: 'number', label, min, max, required }); }
function qFile(label, required = false) { return ({ type: 'file', label, required }); }

function assessmentTemplate(n) {
  return {
    title: `Assessment #${n}`,
    sections: [
      makeSection('Basics', [
        qShort('Full name', true),
        qSingle('Are you legally eligible to work?', ['Yes','No'], true),
        qNum('Years of experience', 0, 40, true),
        qSingle('Preferred work type', ['Onsite','Hybrid','Remote']),
        qMulti('Technologies you use often', ['React','Node','Python','Go','Kotlin','TypeScript','Kubernetes']),
      ]),
      makeSection('Technical', [
        qLong('Describe a recent project you’re proud of', false),
        qMulti('Areas of strength', ['Frontend','Backend','Infra','ML','Data','Product thinking']),
        qSingle('Comfort with testing', ['Low','Medium','High']),
        qLong('How do you ensure reliability in production?', false),
        qFile('Attach resume/CV', true)
      ])
    ]
  };
}

export const __seeds = {
  jobs: genJobs(),
  candidates: genCandidates(),
  assessments: { 1:assessmentTemplate(1), 2:assessmentTemplate(2), 3:assessmentTemplate(3), 4:assessmentTemplate(4), 5:assessmentTemplate(5) }
};
