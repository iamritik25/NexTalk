# NexTalk 🎥

NexTalk is a high-performance, real-time video conferencing application built using modern web technologies. It achieves sub-100ms peer-to-peer (P2P) signaling latency and features a robust, secure backend architecture designed for scale.

## 🚀 Key Features

- **Real-Time Video/Audio:** High-quality peer-to-peer communication powered by **WebRTC**.
- **Blazing Fast Signaling:** Utilizing **Socket.IO** for seamless client-to-server and client-to-client communication.
- **Admin Dashboard:** A clean, professional 2D Material-UI dashboard for system administrators to monitor real-time metrics (CPU usage, database health, total users, and active meetings).
- **Interactive Suite**: Real-time in-call chat and floating emoji reactions for enhanced engagement.
- **Lobby System**: Secure pre-meeting area for device verification (Mic/Cam) and identity setup.
- **Optimized Scalability:** Server-side pagination implemented on massive data collections to prevent memory crashes.

## ⚡ The "Latency Killer": How NexTalk Achieves Sub-100ms Speed

The biggest challenge in video conferencing is latency. NexTalk solves this through a **Hybrid Signaling-P2P Architecture**:

1.  **Direct Media Path (WebRTC)**: Unlike traditional apps that route video through a central server, NexTalk establishes a direct P2P connection between users. Once the "handshake" is done, video data travels the shortest possible physical path between participants.
2.  **Lean Signaling Layer**: The Node.js/Socket.IO backend is used *exclusively* for coordination (exchanging SDP offers and ICE candidates). By keeping the server "out of the media loop," we eliminate server processing time and bandwidth bottlenecks.
3.  **Efficient State Management**: By using a stateless backend and localized React state, we ensure the UI reacts instantly to incoming peer data without waiting for database round-trips.

## 🛠️ Technology Stack

**Frontend:** React.js, Material-UI (MUI), Socket.IO Client, Framer Motion.
**Backend:** Node.js, Express.js, Socket.IO.
**Database:** MongoDB (with Mongoose).
**Communication:** WebRTC (P2P Mesh).

## 🏗️ Architecture

NexTalk utilizes a classic 3-tier architecture:
`React.js Client` ➔ `Node.js/Express + Socket.IO` ➔ `MongoDB`

The application handles WebRTC signaling (SDP offer/answer and ICE candidate exchange) entirely through Socket.IO. Once peers are connected, media streams are transmitted directly Peer-to-Peer without passing through the Node.js server.

## 🛡️ Security

- **Hardened API**: Implements `helmet` for CSP and `bcrypt` for password hashing.
- **RBAC**: Role-Based Access Control for secure Admin operations.
- **Privacy First**: No sensitive `.env` data or local paths are ever exposed.

## 📄 License

This project is licensed under a **Proprietary License**. Unauthorized use is strictly prohibited. See the [LICENSE](LICENSE) file for details.

---
*Created for performance. Designed for people.*
