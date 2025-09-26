
```markdown
# 🌟 TalentFlow

TalentFlow is a **modern recruitment and talent management platform** built with React and Vite.  
It provides recruiters and hiring managers with a **complete simulation of an Applicant Tracking System (ATS)** — from job postings and candidate tracking to assessments and analytics.  

Unlike basic demo apps, TalentFlow uses **mock APIs** (via MSW) and an **IndexedDB database** (via Dexie) to create a fully interactive environment without requiring a backend server.

---

## 🌐 Live Demo
You can try out the project here:  
👉 [TalentFlow on Vercel](https://talent-flow-topaz-nu.vercel.app/)

---

## 📌 Table of Contents
- [✨ Features](#-features)
- [🖥️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Tech Stack](#️-tech-stack)
- [📖 Documentation](#-documentation)
- [📈 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

### 🎯 Job Management
- Create, edit, and list job postings.  
- Manage attributes like **title, description, status, and order**.  
- Track the lifecycle of jobs (Open → Closed → Draft).  

### 👥 Candidate Tracking
- Store candidate details (name, email, pipeline stage, linked job).  
- Move candidates through hiring stages (Applied → Interviewing → Offer → Hired).  
- Link candidates directly to specific jobs.  

### 📝 Assessments & Submissions
- Assign mock assessments to jobs.  
- Track candidate submissions with **timestamps and job associations**.  
- Simulate evaluation workflows.  

### 📊 Analytics & Insights
- Collect mock statistics from MSW handlers.  
- Visualize candidate distribution across stages.  
- Gain insights into hiring bottlenecks and activity.  

### 🎨 User Interface
- **Kanban-style panels** for visual workflows.  
- **Pagination** for large datasets.  
- **Light/Dark theme toggle** for accessibility.  
- **Responsive layout** for desktop and mobile.  

---

## 🖥️ Project Structure

```

src/
├── api/            # API client
├── components/     # Reusable UI components
├── lib/            # API helpers
├── mocks/          # Mock API (MSW handlers + Dexie DB + seeds)
├── pages/          # Page-level components (Jobs, Candidates, etc.)
├── utils/          # Utility functions
├── App.jsx         # Root React component
├── main.jsx        # App entry point
└── styles.css      # Global styles

````

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher  
- **npm** (comes with Node)

### Installation
```bash
git clone <your-repo-url>
cd Talent-flow
npm install
````

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it.

### Production Build

```bash
npm run build
npm run preview
```

This builds the app into the `dist/` folder and serves it locally.

---

## ⚙️ Tech Stack

* **Frontend Framework**: React 18
* **Build Tool**: Vite 5
* **Database**: IndexedDB (via Dexie)
* **Mock API Layer**: MSW (Mock Service Worker)
* **UI Utilities**: @dnd-kit (drag & drop), Theme Toggle
* **Language**: JavaScript (ES Modules)

---

## 📖 Documentation

For a **comprehensive overview** of what TalentFlow does, including its purpose, user journeys, technical architecture, and roadmap, see:

👉 [documentation.md](./documentation.md)

---

## 📈 Roadmap

Planned improvements and features:

* ✅ Mock-based ATS simulation
* 🔲 Replace mock DB with real backend integration
* 🔲 Expand analytics into full dashboards
* 🔲 Add authentication & role-based access (Recruiter, Manager, Admin)
* 🔲 Integrate calendar/email notifications for interviews

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.
You are free to use, modify, and distribute it with attribution.


