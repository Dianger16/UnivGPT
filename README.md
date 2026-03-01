<div align="center">
  <h1>UnivGPT 🎓</h1>
  <p><strong>Agentic Internal University AI & Document Pipeline</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="Postgres" />
    <img src="https://img.shields.io/badge/Pinecone-000000?style=flat-square&logo=pinecone&logoColor=white" alt="Pinecone" />
    <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License" />
  </p>
</div>


## 🌟 Overview

**UnivGPT** is a production-grade, AI-powered document search and role-based access platform tailored specifically for universities. It allows students, faculty, and administrators to seamlessly query campus policies, fee deadlines, course syllabi, and administrative documents through an intelligent, context-aware chatbot.

### ✨ Key Features
- **🤖 Role-Aware AI Agent**: Custom conversational engine that understands user context (Student, Faculty, Admin).
- **📚 Intelligent RAG Pipeline**: Hybrid embedding search using Supabase and Pinecone to provide accurate citations.
- **🎨 Premium UI/UX**: Ultra-modern, fully responsive interface featuring glassmorphism, fluid animations, and dark mode.
- **🔐 Strict Moderation**: Real-time intent classification and toxicity filtering to protect campus rules.
- **☁️ Cloud-Native Stack**: Engineered for scale using FastAPI, React (Vite), and managed vector databases.

---

## 🚀 Quick Start Guide

### Prerequisites
Before you start, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+)
- [Python](https://www.python.org/) (v3.11+)

### 1. 📦 Clone & Environment Setup
Clone the repository and set up your local environment files.

```bash
git clone https://github.com/your-username/UnivGPT.git
cd UnivGPT

# Setup backend environment
cp backend/.env.example backend/.env

# Setup frontend environment
cp frontend/.env.example frontend/.env.local
```
*(Make sure to open the `.env` files and add your real API keys before continuing!)*

### 2. ⚙️ Start the Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # On Windows
# source venv/bin/activate   # On Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the local development server
uvicorn app.main:app --reload --port 8000
```
> The API will be available at `http://localhost:8000`. You can view interactive docs at `http://localhost:8000/docs`.

### 3. 🖥️ Start the Frontend (React + Vite)

Open a new terminal window:
```bash
cd frontend

# Install packages
npm install

# Start the frontend dev server
npm run dev
```
> The web application will launch at `http://localhost:5173`.

---

## ☁️ Setting Up Cloud Services

To run UniGPT fully, you need to configure two cloud services:

1. **Supabase (Relational DB & Auth)** 🟢
   - Create a free project at [Supabase](https://supabase.com).
   - Go to the SQL Editor and run the schema found in `backend/database_schema.sql` to initialize your database tables.
   - Add your Supabase `URL` and `Anon Key` to your `.env` files.

2. **Pinecone (Vector Database)** 🌲
   - Create a free tier index at [Pinecone](https://pinecone.io).
   - Name the index `unigpt`, set dimensions to `384` (for HuggingFace local models).
   - Add your Pinecone API Key to `backend/.env`.

---

## 🔒 User Roles & Permissions

| Role | Access Level | Document Management | User Management |
|------|--------------|---------------------|-----------------|
| 🎓 **Student** | Can query general/public university documents. | ❌ No | ❌ No |
| 👨‍🏫 **Faculty** | Can query public and faculty-restricted documents. | ✅ Can upload course materials. | ❌ No |
| 🛡️ **Admin** | Unrestricted access to all data. | ✅ Can upload & delete any documents. | ✅ Can manage users & view audit logs. |

---

## 🛠️ Technology Architecture

### **The RAG Pipeline Logic**
1. **Query & Intent**: The user asks a question. The AI intercepts the query to check for malicious intent or off-topic chatter.
2. **Context Retrieval**: The user's role is sent to **Pinecone** to fetch vector-embedded document chunks that the user actually has permission to view.
3. **Augmentation**: The raw documents, time context, and user question are injected into the **System Prompt**.
4. **Generation**: The LLM strictly answers using *only* the provided institutional documents, preventing hallucinations.

---

## 🤝 Contributing
Contributions are always welcome! Feel free to open a Pull Request or create an Issue to discuss improvements, bugs, or features you want to add.

## 📄 License
This project is licensed under the [MIT License](LICENSE).
