# Team Task Manager — TaskFlow

A full-stack team project and task management web app with role-based access control.

**Live Demo:** [https://your-app.railway.app](https://your-app.railway.app)  
**GitHub:** [https://github.com/harlalkaharsu/team-task-manager](https://github.com/Harlalkaharsu/team-task-manager)

---

## Features

- **Authentication** — Signup / Login with JWT (7-day tokens)
- **Role-Based Access** — Global roles (Admin / Member) + per-project roles
- **Projects** — Create, view, update, delete projects; invite/remove team members
- **Tasks** — Create tasks with title, description, priority, due date, assignee; Kanban board (Todo / In Progress / Done)
- **Dashboard** — Stats overview: total projects, tasks by status, overdue count, recent activity
- **Overdue Detection** — Tasks past due date are flagged in red across the UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Frontend | React 18, Vite, Tailwind CSS |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Deployment | Railway |

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # DB schema (User, Project, Task, etc.)
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # auth.js, roleGuard.js
│   │   ├── routes/              # auth, projects, tasks, users
│   │   └── index.js             # Express app entry
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js         # Axios instance with auth interceptor
│   │   ├── context/AuthContext  # Global auth state
│   │   ├── pages/               # Login, Signup, Dashboard, Projects, ProjectDetail
│   │   ├── components/          # Navbar
│   │   ├── App.jsx              # Routes
│   │   └── index.css            # Tailwind + custom classes
│   ├── index.html
│   └── package.json
├── railway.json                 # Railway deployment config
└── package.json                 # Root scripts
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project with members & tasks |
| PUT | `/api/projects/:id` | Update project (admin/owner) |
| DELETE | `/api/projects/:id` | Delete project (owner only) |
| POST | `/api/projects/:id/members` | Add member by email |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | Get all tasks in a project |
| POST | `/api/tasks/project/:projectId` | Create a task |
| PUT | `/api/tasks/:id` | Update task (status, assignee, etc.) |
| DELETE | `/api/tasks/:id` | Delete task |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/dashboard` | Dashboard stats for current user |
| GET | `/api/users` | List all users (Admin only) |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or cloud like Neon/Supabase)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/team-task-manager.git
cd team-task-manager
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npx prisma db push        # Create tables
npm run dev               # Start on http://localhost:5000
```

### 3. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm run dev               # Start on http://localhost:5173
```

### 4. Open the app
Visit [http://localhost:5173](http://localhost:5173) and create an account.

---

## Deployment on Railway

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/team-task-manager.git
git push -u origin main
```

### 2. Create Railway project
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repository

### 3. Add PostgreSQL
- In Railway dashboard → Add Service → PostgreSQL
- Railway auto-sets `DATABASE_URL`

### 4. Set environment variables
In your Railway service settings → Variables:
```
JWT_SECRET=your-random-secret-key-here
NODE_ENV=production
```

### 5. Deploy
Railway auto-deploys on every push to `main`. The `railway.json` config handles build and start.

After deployment, run the database migration via Railway's shell:
```bash
cd backend && npx prisma db push
```

---

## Environment Variables

### Backend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing JWTs | `super-secret-key` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | CORS allowed origin | `https://your-app.railway.app` |

### Frontend (`.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (leave empty for same-origin deploy) |

---

## Database Schema

- **User** — id, name, email, password (hashed), role (ADMIN/MEMBER)
- **Project** — id, name, description, ownerId
- **ProjectMember** — projectId, userId, role (ADMIN/MEMBER) — unique per project
- **Task** — id, title, description, status (TODO/IN_PROGRESS/DONE), priority (LOW/MEDIUM/HIGH), dueDate, projectId, creatorId, assigneeId

---

## License

MIT
