# SyncTalk
### Distributed Real-Time Messaging & Presence Platform

SyncTalk is a backend-focused, real-time messaging system designed to demonstrate **production-grade backend architecture** for chat-based applications such as team collaboration tools, customer support systems, and multiplayer platforms.

The system separates **persistent data handling** from **real-time communication**, following patterns used in large-scale systems like Slack and Discord.

---

## Features

- Real-time one-to-one and group messaging
- User presence (online / offline / last seen)
- Typing indicators
- Message delivery and read receipts
- Offline push notifications
- Secure JWT-based authentication
- Horizontally scalable WebSocket architecture

---

## System Design Overview

SyncTalk follows a **hybrid communication model**:

- **REST APIs** → persistent data (users, conversations, message history)
- **WebSockets (Socket.IO)** → real-time events (messages, typing, presence)
- **Redis** → pub/sub messaging, presence tracking
- **PostgreSQL** → durable message storage

This separation ensures low latency, scalability, and clarity in system behavior.

---

## Architecture

Client (Web)
├── REST APIs
└── WebSocket (Socket.IO)

Backend (NestJS)
├── Auth Module (JWT)
├── REST API Layer
├── WebSocket Gateway
├── Presence & Typing Services
├── Notification Service
├── Redis (Pub/Sub, Presence)
└── PostgreSQL (Persistent Storage)

markdown
Copy code

---

## Tech Stack

### Backend
- **Language:** TypeScript  
- **Framework:** NestJS  
- **API:** REST  
- **Real-Time:** Socket.IO  
- **Database:** PostgreSQL  
- **Cache / Broker:** Redis  
- **Authentication:** JWT (Access + Refresh Tokens)  
- **Notifications:** Firebase Cloud Messaging (FCM)

### Frontend
- **Framework:** React (TypeScript)  
- **HTTP Client:** Axios  
- **Real-Time Client:** socket.io-client  
- **Styling:** Tailwind CSS  

### DevOps
- Docker  
- AWS (RDS, ElastiCache)  
- GitHub Actions (CI/CD)

---

## Message Flow

User sends message
→ WebSocket Gateway
→ Authentication & validation
→ Message stored in PostgreSQL
→ Redis Pub/Sub fan-out
→ Delivered to online users
→ Push notification if recipient is offline

yaml
Copy code

---

## Data Storage

### PostgreSQL
Stores all persistent data:
- Users
- Conversations
- Messages
- Message delivery/read status

### Redis
Used for:
- User presence tracking (TTL-based keys)
- Message broadcasting (Pub/Sub)
- Rate limiting
- Socket.IO scaling

---

## Authentication & Security

- JWT-based access control
- Refresh token rotation
- WebSocket authentication guards
- Rate limiting on real-time events

All WebSocket connections are authenticated before joining any conversation rooms.

---

## Project Structure

synctalk/
├── backend/
│ ├── src/
│ ├── Dockerfile
│ └── package.json
├── frontend/
│ ├── src/
│ └── package.json
├── docker-compose.yml
├── docs/
│ ├── architecture.md
│ ├── api-spec.md
│ └── socket-events.md
└── README.md

yaml
Copy code

---

## Testing

- Unit tests for core services
- Integration tests for REST APIs
- WebSocket event testing
- Load testing using Artillery / k6 (optional)

---

## Running Locally

### Prerequisites
- Node.js (18+)
- Docker
- PostgreSQL
- Redis

### Start services
```bash
docker-compose up
Backend
bash
Copy code
cd backend
npm install
npm run start:dev
Frontend
bash
Copy code
cd frontend
npm install
npm run dev