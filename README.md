# UniGPT — Agentic Internal University GPT

> AI-powered document search and role-based access platform for universities.

![UniGPT](https://img.shields.io/badge/UniGPT-v1.0.0-purple)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
- **Python** 3.11+
- **Docker** (optional, for local Supabase)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd UniGPT
cp .env.example .env       # Fill in your keys
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # Fill in your keys
npm install
npm run dev                   # http://localhost:5173
```

### 4. Database (Docker)

```bash
cd infrastructure
docker-compose up -d

# Run migrations
docker exec -i infrastructure-db-1 psql -U postgres < supabase/migrations/001_initial_schema.sql

# Load seed data
docker exec -i infrastructure-db-1 psql -U postgres < supabase/seed.sql
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `SUPABASE_JWT_SECRET` | JWT secret for token validation | ✅ |
| `SUPABASE_DB_URL` | PostgreSQL connection string | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM calls | ✅ |
| `OPENROUTER_MODEL` | LLM model (default: `meta-llama/llama-3.1-70b-instruct`) | ❌ |
| `OPENROUTER_EMBEDDING_MODEL` | Embedding model (default: `openai/text-embedding-3-small`) | ❌ |
| `OPENROUTER_BASE_URL` | OpenRouter base URL | ❌ |
| `MOCK_LLM` | Set to `true` for dev/testing without real API calls | ❌ |
| `CORS_ORIGINS` | Comma-separated allowed origins | ❌ |

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_URL` | Backend API URL (default: `http://localhost:8000`) |

---

## 📁 Project Structure

```
UniGPT/
├── frontend/               # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui primitives (Button, Card, Input, Badge)
│   │   │   ├── chat/       # ChatWidget with citations
│   │   │   └── layout/     # DashboardLayout with sidebar
│   │   ├── pages/          # Page components
│   │   │   ├── Landing.tsx  # Marketing landing page
│   │   │   ├── auth/       # Login, Signup, ForgotPassword, VerifyEmail
│   │   │   └── dashboard/  # StudentDashboard, FacultyDashboard, AdminDashboard
│   │   ├── store/          # Zustand stores (authStore, chatStore)
│   │   ├── lib/            # API client, Supabase client, utilities
│   │   ├── App.tsx         # Router with protected routes
│   │   └── index.css       # Design system + Tailwind
│   └── vite.config.ts
│
├── backend/                # Backend (FastAPI + Python)
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Pydantic settings
│   │   ├── middleware/      # Auth (JWT) + RBAC middleware
│   │   ├── routers/        # Auth, Documents, Agent routers
│   │   ├── services/       # Supabase client, document processor, agent pipeline
│   │   └── models/         # Pydantic schemas
│   ├── tests/              # Unit & integration tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── infrastructure/         # Docker & DB
│   ├── docker-compose.yml
│   └── supabase/
│       ├── migrations/     # SQL schema
│       └── seed.sql        # Sample data
│
├── docs/                   # Design docs
│   └── design.md           # Architecture + pipeline diagrams
│
├── .github/workflows/      # CI/CD
│   └── ci.yml
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🤖 Agent Pipeline

The RAG (Retrieval-Augmented Generation) pipeline:

1. **Auth & Role Check** — Verify JWT, extract user role
2. **Intent Classification** — Classify query type (factual / policy / personal / admin)
3. **Role-Filtered Search** — pgvector similarity search with `metadata.role` filter
4. **Evidence Filtering** — Require matching docs; safe fallback if none found
5. **Response Generation** — LangChain → OpenRouter LLM with context
6. **Source Citations** — Attach document IDs, titles, snippets
7. **Redaction Guardrails** — Block unauthorized access, log escalations

See [docs/design.md](docs/design.md) for detailed diagrams.

---

## 🔒 Roles & Access

| Role | Can Access | Can Upload | Can Manage |
|------|-----------|-----------|-----------|
| **Student** | student + public docs | ❌ | ❌ |
| **Faculty** | faculty + public docs | faculty/public docs | ❌ |
| **Admin** | all docs | all doc types | users, audit logs, settings |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend type check + build
cd frontend
npx tsc --noEmit
npm run build
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register (student default) | No |
| POST | `/auth/login` | Login → JWT | No |
| GET | `/user/me` | Get profile | Yes |
| POST | `/admin/users/invite` | Invite faculty/admin | Admin |
| GET | `/admin/users` | List all users | Admin |
| POST | `/admin/documents` | Upload & tag document | Admin/Faculty |
| GET | `/documents` | List accessible docs | Yes |
| GET | `/documents/:id` | Get single document | Yes |
| DELETE | `/admin/documents/:id` | Delete document | Admin |
| POST | `/agent/query` | Chat query (RAG) | Yes |
| GET | `/agent/history` | Conversation history | Yes |
| GET | `/admin/audit-logs` | View audit logs | Admin |
| GET | `/health` | Health check | No |
| GET | `/metrics` | System metrics | No |

Full OpenAPI docs available at `http://localhost:8000/docs`

---

## 📦 Deployment

1. Set all environment variables in your hosting platform
2. Build frontend: `cd frontend && npm run build` → deploy `dist/`
3. Deploy backend: `cd backend && uvicorn app.main:app --host 0.0.0.0`
4. Ensure Supabase is configured with the migration schema
5. Create initial admin user through Supabase dashboard or seed script

---

## 📄 License

MIT
