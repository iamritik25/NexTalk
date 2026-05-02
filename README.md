# NexTalk 🎥

NexTalk is a high-performance, real-time video conferencing application built using modern web technologies. It achieves sub-100ms peer-to-peer (P2P) signaling latency and features a robust, secure backend architecture designed for scale.

## 🚀 Features

- **Real-Time Video/Audio:** High-quality peer-to-peer communication powered by **WebRTC**.
- **Blazing Fast Signaling:** Utilizing **Socket.IO** for seamless client-to-server and client-to-client communication.
- **Admin Dashboard:** A clean, professional 2D Material-UI dashboard for system administrators to monitor real-time metrics (CPU usage, database health, total users, and active meetings).
- **Role-Based Access Control (RBAC):** Secure admin API endpoints protected by custom authentication middleware. 
- **Optimized Scalability:** Server-side pagination implemented on massive data collections (like Meeting histories) to prevent memory crashes.
- **Secure Architecture:** Hardened API endpoints using `bcrypt` for password hashing and `helmet` for Content Security Policies (CSP).

## 🛠️ Technology Stack

**Frontend:**
- React.js
- Material-UI (MUI)
- Socket.IO Client
- Framer Motion

**Backend:**
- Node.js & Express.js
- MongoDB (with Mongoose)
- Socket.IO
- WebRTC (P2P Mesh)

## 🏗️ Architecture

NexTalk utilizes a classic 3-tier architecture:
`React.js Client` ➔ `Node.js/Express + Socket.IO` ➔ `MongoDB`

The application handles WebRTC signaling (SDP offer/answer and ICE candidate exchange) entirely through Socket.IO. Once peers are connected, media streams are transmitted directly Peer-to-Peer without passing through the Node.js server, significantly reducing backend bandwidth and CPU load.

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (Local or Atlas)

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and start the server:
```bash
cd backend
npm install
npm start
```
*Note: Make sure you have a `.env` file in your backend folder containing your `MONGO_URI`.*

### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the React app:
```bash
cd frontend
npm install
npm start
```
The application will automatically open at `http://localhost:3000`.

## 🛡️ Admin Access

By default, all new users are given the standard `user` role. To test out the newly rebuilt Admin Dashboard:
1. Register a new account on the frontend.
2. Open your MongoDB GUI (e.g., MongoDB Compass).
3. Navigate to the `users` collection.
4. Find your newly created user document and change the `role` field from `"user"` to `"admin"`.
5. Navigate to `http://localhost:3000/admin` to access the secure portal.
