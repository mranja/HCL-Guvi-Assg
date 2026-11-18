# PulsePoll — Real-Time Live Polling Engine

> A high-concurrency, real-time polling tool where users create polls, share links, and audiences cast votes with instant live-updating graphs and statistics powered by Redis and WebSockets.

---

## ⚡ Tech Stack

| Layer | Technology | Key Responsibility |
|---|---|---|
| **Frontend** | React (Vite, Tailwind CSS, Recharts, Lucide) | Dynamic UI, live vote charts, shareable links, and WebSocket event listener |
| **Backend** | Go (Gin Web Framework, Gorilla WebSocket) | High-throughput REST API, WebSocket room manager, JWT authentication |
| **Database** | MongoDB | Persistent document storage for users, poll metadata, and audit logs |
| **Realtime** | Redis | Atomic vote counters (`HINCRBY`), anti-duplicate sets (`SADD`), and Pub/Sub broadcasting |

---

## 💡 How Redis is Doing Meaningful Work

Unlike systems where Redis is merely a cache or absent:
1. **Atomic O(1) Vote Counting:** Every incoming vote calls `HINCRBY poll:<id>:votes <option_id> 1` and `INCR poll:<id>:total`. This bypasses write bottlenecks and guarantees race-condition free counts even under high traffic.
2. **Duplicate Vote Prevention:** Voter keys (cryptographic device fingerprints/IP hashes) are recorded in Redis Sets using `SADD poll:<id>:voters <hash>`. If `SADD` returns `0`, the request is immediately rejected before touching MongoDB.
3. **Real-time Event Fan-out (Pub/Sub):** The backend publishes updates to `poll:<id>:updates`. Redis distributes these events across all running backend instances and gorilla WebSocket listeners.
4. **MongoDB Write Synchronization:** MongoDB safely persists long-term history and audit logs asynchronously in the background.

---

## 🚀 Running Locally

### Option 1: One-Click Docker Compose (Recommended)
Prerequisites: Docker & Docker Compose

```bash
# Clone the repository
git clone https://github.com/mranja/HCL-Guvi-Assg.git
cd HCL-Guvi-Assg

# Launch all 4 services (Frontend, Backend, Redis, MongoDB)
docker-compose up --build
```
- Open `http://localhost` in your browser.

---

### Option 2: Running Without Docker

#### 1. Start MongoDB & Redis
Make sure MongoDB (`localhost:27017`) and Redis (`localhost:6379`) are running on your machine (or use free cloud instances from [MongoDB Atlas](https://www.mongodb.com/atlas) and [Upstash Redis](https://upstash.com)).

#### 2. Start the Go Backend
```bash
cd backend
cp .env.example .env
go run main.go
```
The backend starts on `http://localhost:8080`.

#### 3. Start the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 🌐 Deploying to Production (Free Live Link)

This repository is ready to ship to free cloud hosting platforms:

### A. Deploy Backend to Render or Railway
1. **Database & Redis:**
   - Create a free database on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Create a free Redis instance on [Upstash Redis](https://upstash.com).
2. **Backend Web Service:**
   - On [Render](https://render.com) or [Railway](https://railway.app), create a new Web Service pointing to the `/backend` folder or Dockerfile.
   - Set Environment Variables:
     - `PORT`: `8080`
     - `MONGODB_URI`: your MongoDB Atlas connection string
     - `MONGODB_DB`: `pulsepoll`
     - `REDIS_URI`: your Upstash Redis connection string (`rediss://...`)
     - `JWT_SECRET`: your secret string
     - `FRONTEND_URL`: your frontend deployed domain

### B. Deploy Frontend to Vercel or Netlify
1. Create a new project on [Vercel](https://vercel.com) connecting this repository.
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
4. Deploy!

---

## 🛡️ Security & Architecture Decisions
- **Input Validation:** Strict Go validator schemas on request payloads (min/max lengths, email formats, option counts).
- **Authentication:** Password hashing with `bcrypt` cost factor, JWT with expiry validation.
- **Auditing:** MongoDB logs every vote with a voter key hash and timestamp in `vote_logs`.
- **UX Polish:** Micro-confetti animations upon voting, share-link copy to clipboard, and instant toggling between bar views and analytics charts.
