# VistaConvo.ai

VistaConvo.ai is a minimal chatbot platform built with the **MERN** stack and a **modern dark UI** using **React + Tailwind CSS**.  
Users can:

- Register and log in (JWT auth)  
- Create and manage multiple projects/agents  
- Configure prompts per project  
- Chat with an AI assistant in a streaming chat UI  
- (Optional) Upload files associated with a project

> Note: The chat backend can use a real LLM provider (OpenAI/OpenRouter) or a mocked streaming response for demo purposes.

## Architecture Overview

### High‑Level Design

- **Frontend**: React + TypeScript + Vite + Tailwind CSS  
  - Handles authentication, project management, and chat UI.  
  - Uses React Router for routing and React Query for data fetching and cache.

- **Backend**: Node.js + Express + TypeScript  
  - Exposes REST APIs under `/api` for auth, projects, chat, and optional file upload.  
  - Uses JWT for authentication and authorization middleware.  
  - Proxies chat requests to an LLM service (or a mock streaming generator).

- **Database**: MongoDB Atlas  
  - Stores users, projects, and chat history.  
  - Indexed by user and project for multi‑user scalability.

### Data Models (Simplified)

- **User**
  - `email`, `passwordHash`, timestamps.
- **Project**
  - `userId` (owner), `name`, `description`, `prompts[]`, `openaiFiles[]`, timestamps.
- **Chat**
  - `projectId`, array of `{ role: 'user' | 'assistant', content, timestamp }`, timestamps.

### Key Backend Endpoints

- POST /api/auth/register – create user
- POST /api/auth/login – login, returns JWT
- GET /api/projects – list projects for logged‑in user
- POST /api/projects – create project
- GET /api/projects/:id – project details
- PUT /api/projects/:id – update prompts
- POST /api/chat/:projectId – send message, stream AI response
- GET /api/chat/:projectId/history – fetch chat history
- POST /api/projects/:id/files – (optional) upload file for project

### Non‑Functional Considerations

- **Scalability**:  
  - Stateless backend; can be horizontally scaled.  
  - MongoDB Atlas with indexes on `userId` / `projectId`.

- **Security**:  
  - Passwords hashed with bcrypt.  
  - JWT for stateless auth; protected routes use auth middleware.  
  - Secrets stored in environment variables.

- **Extensibility**:  
  - Clear separation of layers: `routes`, `models`, `services`, `middleware`.  
  - Easy to plug in new providers (e.g., swap mock → OpenAI/OpenRouter).

- **Performance & UX**:  
  - Streaming responses in chat for low perceived latency.  
  - Client‑side caching with React Query.

## Prerequisites

- Node.js (>= 18)  
- npm or yarn  
- A MongoDB Atlas cluster (or local MongoDB)  
- Optional: LLM API key (OpenAI/OpenRouter)  
  - For demo, the LLM can be mocked without any external key.

## Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
2. Create environment file
   ```bash
   cp .env.example .env
  Fill in:
  MONGO_URI=your-mongodb-connection-string
  JWT_SECRET=your-jwt-secret-at-least-32-chars
  # One of the following, or none if using mock responses:
  OPENAI_API_KEY=sk-proj-...
  OPENROUTER_API_KEY=sk-or-v1-...
3. Run the backend in dev mode
   npm run dev
   API available at http://localhost:5000/api.

## Frontend Setup

1. Install dependencies
   cd frontend
   npm install
2. Create environment file cp .env.example .env
   VITE_API_URL=http://localhost:5000/api
3. Run the frontend - npm run dev


## How to use

Start backend (npm run dev in /backend)

Start frontend (npm run dev in /frontend)

Browser flow:

  Register → Login → Dashboard

  Create project → Click project card

  Chat with AI (streaming responses)

  ⚙️ Settings to edit prompts
4. 
