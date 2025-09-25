# TalentFlow – Comprehensive Project Documentation

## 📌 Introduction
TalentFlow is a **modern recruitment and talent management platform** built with **React and Vite**.  
It provides recruiters and hiring managers with a complete simulation of an **Applicant Tracking System (ATS)**, helping them manage jobs, candidates, and assessments.  

Unlike a simple demo, TalentFlow uses **mock APIs and a Dexie-powered IndexedDB database** to create a fully interactive experience — no backend server required.  

The goal of this project is twofold:
1. Demonstrate how to architect a scalable, front-end–driven ATS system.  
2. Provide a realistic sandbox environment for prototyping hiring workflows.  

---

## 🖥️ System Overview
TalentFlow is organized into modules that reflect real-world hiring processes:

- **Jobs Module** → manage job postings and hiring stages.  
- **Candidates Module** → handle candidate profiles, pipelines, and job matching.  
- **Assessments Module** → simulate tests and evaluation submissions.  
- **Analytics Module** → provide insights into hiring pipelines.  
- **UI Components** → reusable building blocks such as pagination, side panels, and theme toggles.  
- **Mocks Module** → MSW handlers + Dexie database for data persistence.  

This modular design allows the project to be extended later with a **real backend API** or additional recruiter-focused tools.

---

## 🎯 Core Features

### 1. Job Management
- Create, edit, and view job postings.  
- Each job includes:
  - Title (e.g., “Frontend Engineer”)  
  - Description (role summary, expectations)  
  - Status (Open, Closed, Draft)  
  - Order/priority in the hiring pipeline  
- Jobs are stored in **IndexedDB** and seeded automatically for demo purposes.

---

### 2. Candidate Tracking
- Add candidates with attributes such as:
  - Name  
  - Email  
  - Stage (Applied, Screening, Interview, Offer, Hired)  
  - Linked Job ID  
- Candidates move through pipeline stages, giving recruiters visibility into hiring progress.  
- Designed to mimic professional ATS tools like Greenhouse or Lever.

---

### 3. Assessments & Submissions
- Jobs can have **assessments** attached.  
- Candidates can “submit” mock assessments tied to job IDs.  
- Submissions track:
  - Candidate ID  
  - Job ID  
  - Date/time of submission  
- This creates a realistic hiring test environment without external tools.

---

### 4. Analytics & Insights
- Statistics collected via mock handlers (`stats.js`).  
- Simulates metrics like:
  - Number of candidates per job  
  - Distribution of candidates across pipeline stages  
  - Submission activity  
- Provides recruiters with **actionable insights** to improve the hiring process.

---

### 5. Interactive User Interface
- **Kanban-Style Panels** → visualize candidate pipelines.  
- **Pagination** → manage large sets of candidates/jobs.  
- **Theme Toggle** → switch between light/dark modes for accessibility.  
- **Responsive Layout** → optimized for both desktop and mobile usage.

---

## 👩‍💼 User Journey

### Recruiter Workflow
1. **Create a Job Posting**  
   Add details about the role, including title and description.  
2. **Add Candidates**  
   Enter candidate details and assign them to jobs.  
3. **Track Candidates**  
   Move candidates through stages (Applied → Interviewing → Offer → Hired).  
4. **Assign Assessments**  
   Link assessments to jobs and monitor candidate submissions.  
5. **View Analytics**  
   Use stats to understand hiring bottlenecks and candidate flow.

### Candidate Experience (Simulated)
1. Candidate is added to the system.  
2. They get assigned to a job and stage.  
3. They can “submit” an assessment.  
4. Their data updates in the recruiter dashboard.  

---

## ⚙️ Technical Architecture

- **Frontend**: React + Vite  
- **State Management**: Component-level state with potential to extend into Redux/Context.  
- **Database**: IndexedDB via Dexie (`db.js`).  
- **Mock API Layer**: MSW intercepts network calls and serves data from IndexedDB.  
- **Seeding**: `seedDB.js` pre-populates jobs and candidates.  
- **Utilities**: Helpers for pagination, slugify, latency simulation, etc.  

**Flow Example:**
1. Recruiter loads app → MSW intercepts API requests.  
2. Request routed to mock handler (e.g., `/jobs`).  
3. Handler queries Dexie DB.  
4. Response returned as if it were from a backend.  
5. React UI updates accordingly.  

---

## 🚀 Future Roadmap
TalentFlow is built to be extendable. Potential future upgrades include:

- **Backend Integration**
  - Connect with real REST/GraphQL APIs.  
  - Replace IndexedDB with cloud databases.  

- **Advanced Analytics**
  - Dashboard views with charts.  
  - Time-to-hire, source-of-hire, and conversion metrics.  

- **User Roles & Authentication**
  - Recruiters, Hiring Managers, Admins.  
  - Secure login & permissions.  

- **Integrations**
  - Calendar integration for interviews.  
  - Email/SMS notifications for candidates.  
  - Resume parsing and LinkedIn imports.  

---

## 📜 Conclusion
TalentFlow bridges the gap between a **demo app** and a **production-ready ATS prototype**.  
It gives recruiters a full sandbox environment while providing developers with a modern, modular, and extensible codebase.  

This documentation explains **what the system does, how it’s structured, and where it can grow**, ensuring both technical and non-technical stakeholders can understand the project’s value.
