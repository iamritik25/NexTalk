# NexTalk Architecture Overview

![NexTalk Professional Architecture Visual](nextalk_architecture_visual.png)

NexTalk follows a high-performance **3-Tier Architecture** optimized for real-time video communication.

## 🏗️ Technical Architecture Diagram

```mermaid
graph TD
    subgraph "Client Layer (Frontend - React/MUI)"
        A[Video Interface]
        B[Chat Sidebar]
        C[Emoji/Reactions Overlay]
        D[Lobby/Join Room]
        E[Socket.io Client]
    end

    subgraph "Signaling & Logic Layer (Backend - Node.js/Express)"
        F[Socket Manager]
        G[Admin Stats Controller]
        H[Auth Middleware]
        I[Meeting Tracker]
    end

    subgraph "Persistence Layer (Database - MongoDB)"
        J[(Users Collection)]
        K[(Meeting History)]
    end

    subgraph "Peer-to-Peer Communication"
        L[Local Stream]
        M[Remote Stream]
        L <== "WebRTC P2P Data Flow" ==> M
    end

    E <--> F
    F <--> I
    F <--> G
    G <--> K
    H <--> J
    A -- "UI State" --> E
    E -- "Signaling (SDP/ICE)" --> F
    F -- "Broadcast Signal" --> E
```

## 📦 Professional Functional Block Diagram

![NexTalk Vertical Functional Architecture](nextalk_vertical_block_diagram.png)

```mermaid
graph TD
    subgraph "Level 1: Entry & Authentication"
        A1[Landing Page] --> A2[Auth System: Login/Register]
        A2 --> A3[User Dashboard / Home]
    end

    subgraph "Level 2: Meeting Orchestration"
        A3 --> B1[Create/Join Meeting Room]
        B1 --> B2[Meeting History Access]
        B1 --> C1[Meeting Lobby Entrance]
    end

    subgraph "Level 3: Device & Lobby Setup"
        C1 --> C2[Hardware Discovery & Media Permissions]
        C2 --> C3[Live Video/Audio Device Preview]
        C3 --> C4[Identity & Role Assignment]
    end

    subgraph "Level 4: Real-Time Communication Workspace"
        C4 --> D1[P2P WebRTC Media Streaming]
        D1 --> D2[Active Collaboration Features]
        
        subgraph "Interactive Suite"
            D2 --> E1[Instant In-Call Messaging]
            D2 --> E2[Floating Emoji Feedback]
            D2 --> E3[Dynamic Cam/Mic Toggles]
            D2 --> E4[One-Click Link Sharing]
        end
    end

    subgraph "Level 5: Infrastructure & Monitoring"
        F1[Express API / Socket.IO Signaling] --> G1[MongoDB Cluster]
        F1 --> G2[Real-Time System Health Checks]
        
        subgraph "Admin Governance"
            G2 --> H1[Admin RBAC Middleware]
            H1 --> H2[Live Analytics: CPU/RAM/IO]
            H1 --> H3[Optimized Large-Scale Pagination]
        end
    end

    D1 --- F1
    E1 --- F1
    A2 --- F1
```

## 🚀 Key Architectural Pillars & Features

1.  **P2P WebRTC Connectivity**: NexTalk uses Socket.IO only for the initial handshake (signaling). Once the connection is established, video and audio data flow directly between users (Peer-to-Peer), significantly reducing server overhead.
2.  **Full-Stack Real-Time Features**:
    *   **Lobby System**: A sophisticated device-check stage before joining calls.
    *   **Collaboration Tools**: Integrated chat and reactions for active engagement.
    *   **Smart Persistence**: Meeting history and user settings stored with Mongoose models.
3.  **Enterprise-Grade Backend**:
    *   **Stateless Scaling**: Designed to handle multiple concurrent sessions.
    *   **Live Admin Dashboard**: Professional-grade monitoring of system resources and user activity.
    *   **Secure RBAC**: Role-based access control protecting sensitive admin operations.
4.  **Performance Optimization**:
    *   **Sub-100ms Latency**: Optimized signaling path for near-instant connections.
    *   **Server-Side Pagination**: Critical for performance when handling thousands of meeting records.
5.  **Security Hardening**: Standardized use of `helmet`, `bcrypt`, and secure CSP directives.
