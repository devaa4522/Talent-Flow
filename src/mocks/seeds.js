// src/mocks/seeds.js
const rand = (n) => Math.floor(Math.random()*n)
const pick = (arr) => arr[rand(arr.length)]

const TITLES = [
  'Frontend Engineer','Backend Engineer','Fullstack Engineer','DevOps Engineer','QA Engineer',
  'Data Scientist','ML Engineer','Product Manager','UI/UX Designer','Support Engineer'
]
const TAGS = ['remote','hybrid','onsite','contract','full-time','urgent','senior','junior']
const STAGES = ['applied','screen','tech','offer','hired','rejected']
const FIRST = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Sai','Krishna','Ishaan','Kabir','Rohan','Dev','Shreya','Aisha','Ananya','Aarohi','Diya','Ira','Ishita','Kavya','Kiara','Meera','Navya','Riya','Saanvi','Sara','Trisha','Yash','Tanvi','Nikhil','Aditi','Nisha','Sahil','Rakesh','Pranav','Anita','Neha','Karthik','Harsh','Pooja','Sneha','Aman']
const LAST = ['Sharma','Verma','Gupta','Iyer','Reddy','Menon','Patel','Khan','Singh','Das','Rao','Mehta','Agarwal','Bose','Mukherjee','Joshi','Bhat','Shetty','Desai','Kapoor','Malhotra','Banerjee','Ghosh','Kulkarni','Naidu','Pandey','Tripathi','Tiwari','Yadav']

function genJobs(){
  let jobs = []
  for(let i=1;i<=25;i++){
    const title = TITLES[i%TITLES.length] + ' ' + (i%3===0?'Senior':i%3===1?'Mid':'Junior')
    jobs.push({
      id: i,
      title,
      slug: title.toLowerCase().replace(/\s+/g,'-'),
      status: i%3===0?'archived':'active',
      tags: Array.from(new Set([pick(TAGS), pick(TAGS)])).slice(0,2),
      description: 'Role focusing on product delivery, quality, and collaboration.',
      requirements: ['3+ years experience','Ownership mindset','Good communication'],
      order: i
    })
  }
  return jobs
}

function genCandidates(){
  let id = 1
  const total = 1054
  const out = []
  for(let i=0;i<total;i++){
    const name = `${pick(FIRST)} ${pick(LAST)}`
    const email = name.toLowerCase().replace(/\s+/g,'.')+'@example.com'
    out.push({
      id: id++,
      name,
      email,
      stage: pick(STAGES),
      jobId: (i%25)+1
    })
  }
  return out
}

function assessmentTemplate(n){
  return {
    title: `Assessment #${n}`,
    sections: [
      { title: 'Basics', questions: [
        { type:'short', label:'Full name', required:true },
        { type:'single', label:'Are you legally eligible to work?', required:true, options:['Yes','No'] },
        { type:'number', label:'Years of experience', min:0, max:40, required:true }
      ]},
      { title: 'Tech', questions: [
        { type:'multi', label:'Primary tech stack', options:['React','Node','Python','Go','Kotlin'] },
        { type:'long', label:'Tell us about a recent project', required:false }
      ]}
    ]
  }
}

export const __seeds = {
  jobs: genJobs(),
  candidates: genCandidates(),
  assessments: { 1:assessmentTemplate(1), 2:assessmentTemplate(2), 3:assessmentTemplate(3), 4:assessmentTemplate(4), 5:assessmentTemplate(5) }
}
