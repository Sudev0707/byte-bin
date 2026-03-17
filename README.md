# ByteBin 🧠💻

[![MERN](https://img.shields.io/badge/MERN-Stack-blue?logo=mongodb&logoColor=white)](https://mernjs.org/) [![React](https://img.shields.io/badge/React-18-green?logo=react&logoColor=white)](https://reactjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://typescriptlang.org/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![MongoDB](https://img.shields.io/badge/MongoDB-green?logo=mongodb&logoColor=white)](https://mongodb.com/)

**ByteBin** is a modern full-stack MERN application designed as a personal coding problem tracker and analytics dashboard for software engineers. Capture, organize, revisit, and analyze your coding challenges (LeetCode/HackerRank-style) with professional-grade features like interactive dashboards, visual analytics, syntax-highlighted code editors, search/filter/export, and responsive UI.

<div align=\"center\">
  <img src=\"bytebin-client/src/assets/byteBin_Logo.png\" alt=\"ByteBin Logo\" width=\"200\"/>
  <br><em>Streamline your coding journey with ByteBin</em>
</div>

## 🧭 Table of Contents
- [About](#about)
- [✨ Key Features](#key-features)
- [🛠️ Tech Stack](#tech-stack)
- [📁 Project Structure](#project-structure)
- [🚀 Quick Start](#quick-start)
- [🔐 Authentication](#authentication)
- [📊 API Endpoints](#api-endpoints)
- [📱 Screenshots](#screenshots)
- [☁️ Deployment](#deployment)
- [🧪 Testing](#testing)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [👨‍💻 Author](#author)

## About
ByteBin empowers developers to manage coding problems with:
- Rich CRUD operations (title, topic, language, difficulty, description, notes, syntax-highlighted code, solutions, references).
- Real-time dashboard stats (total/daily/monthly problems), recent activity.
- Advanced search/filter/sort/export (JSON/CSV).
- Analytics visualizations for topics, languages, difficulties, trends.
- Responsive design with sidebar nav, dark mode, mobile support.

Built with 100% TypeScript for scalability and type safety. Demonstrates full-stack expertise in modern JS ecosystem.

## ✨ Key Features
- **Dashboard**: Stats, recent problems, quick insights.
- **Problem Management**: Add/Edit/Delete/View with rich editor.
- **Search & Filter**: By topic, language, difficulty.
- **Code Editor**: Syntax highlighting (JS, Python, Java, C++) via CodeMirror.
- **Analytics**: Charts (Recharts) for progress tracking.
- **UI/UX**: shadcn/ui components, Tailwind, responsive/mobile-first.
- **Performance**: TanStack Query caching/optimistic updates.
- **Auth**: Secure login via Clerk (Google/GitHub OAuth).
- **Forms**: React Hook Form + Zod validation.
- **Notifications**: Sonner toasts.

## 🛠️ Tech Stack

### Frontend (`bytebin-client/`)
| Category | Technologies |
|----------|--------------|
| Framework | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, clsx, Tailwind Merge |
| UI Primitives | Radix UI, Lucide React icons |
| State/Data | TanStack Query, React Context |
| Forms | React Hook Form, Zod |
| Editor | @uiw/react-codemirror, themes/languages |
| Charts | Recharts |
| Auth | @clerk/clerk-react |
| Other | Sonner (toasts), Next Themes (dark mode), Axios |
| Testing | Vitest, Testing Library |

### Backend (`backend/`)
| Category | Technologies |
|----------|--------------|
| Runtime | Node.js, Express 5 |
| Database | MongoDB, Mongoose ODM |
| Utils | dotenv, CORS |
| Dev | Nodemon |

### Tools & DevOps
- Build: Vite, Bun (optional for frontend deps)
- Linting: ESLint
- Testing: Vitest
- Monitoring: Sentry (optional)

## 📁 Project Structure
```
d:/MERN/code-companion-main/
├── README.md                 # This file
├── TODO.md                   # Task tracking
├── backend/                  # Node/Express API
│   ├── server.js            # Entry point
│   ├── config/db.js         # MongoDB connection
│   ├── models/AddProblems.js # Mongoose schema
│   ├── controllers/         # Business logic
│   └── routes/              # CRUD routes
├── bytebin-client/          # React frontend
│   ├── src/
│   │   ├── pages/           # Dashboard, ProblemList, AddProblem, etc.
│   │   ├── components/ui/   # shadcn/ui components
│   │   ├── context/         # ProblemsContext
│   │   └── hooks/           # Custom hooks
│   ├── vite.config.ts
│   └── package.json
├── .gitignore
├── aboutProject.txt         # Project metadata
└── project-description.txt  # Detailed description
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Bun (optional, faster for frontend: `bun --version`)

### Backend
```bash
cd backend
copy .env.example .env  # Add MONGO_URI, PORT=5000
npm install
npm run dev
```
Server runs on `http://localhost:5000`.

### Frontend
```bash
cd bytebin-client
bun install  # or npm install
bun dev      # or npm run dev
```
App runs on `http://localhost:5173`.

Open `http://localhost:5173` in browser. Authenticate via Clerk.

## 🔐 Authentication
- Uses [Clerk](https://clerk.com) for auth.
- Configure in `bytebin-client/src/api/axios.js` or Clerk dashboard.
- Supports Email, Google, GitHub OAuth.

## 📊 API Endpoints
Base: `http://localhost:5000/api`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/problems` | Add problem |
| GET | `/problems` | Get all/filtered |
| GET | `/problems/:id` | Get single |
| PUT | `/problems/:id` | Edit |
| DELETE | `/problems/:id` | Delete |

## 📱 Screenshots
<!-- Add screenshots here -->
| Dashboard | Problem List | Add Problem |
|-----------|--------------|-------------|
| ![Dashboard](bytebin-client/public/dashboard.png) | ![Problems](bytebin-client/public/problems.png) | ![Add](bytebin-client/public/add-problem.png) |

## ☁️ Deployment
- **Frontend**: Vercel (`vercel --prod`) or Cloudflare Pages (static-friendly).
- **Backend**: Render, Railway, or VPS with MongoDB Atlas.
- **Database**: MongoDB Atlas (free tier).
- Env vars: `MONGO_URI`, Clerk keys (`CLERK_PUBLISHABLE_KEY`, etc.).

See `bytebin-client/cloudflare-usage.txt` for Cloudflare guide.

## 🧪 Testing
```bash
# Frontend
cd bytebin-client
bun test  # or npm test
```

Backend: Add tests to `backend/package.json`.

## 🤝 Contributing
1. Fork repo.
2. Create feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push (`git push origin feature/amazing-feature`).
5. Open PR.

## 📄 License
ISC License (see `backend/package.json`).

## 👨‍💻 Author
**Sudev Majhi** - Full Stack Developer  
[Portfolio](https://your-portfolio-link) | [GitHub](https://github.com/yourusername) | [LinkedIn](https://linkedin.com/in/sudev-majhi)

---

⭐ **Star this repo if it helps!** Questions? Open an issue.

<!--- Built with ❤️ using modern MERN stack --->

