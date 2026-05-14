# 🌊 Blue Carbon Registry - Blockchain-Based MRV System

[![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum%2FPolygon-blueviolet)](https://ethereum.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Tailwind-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Blue Carbon Registry** is a cutting-edge, decentralized ecosystem designed to monitor, verify, and monetize coastal ecosystem restoration (Mangroves, Seagrass, Salt Marshes). By combining environmental science with blockchain technology, we provide a transparent, auditable platform for carbon credit generation and trading.

---

## 🚀 Key Features

### 🔐 Secure Identity & Land Verification
- **Multi-Step Authentication**: OTP-verified email registration.
- **Role-Based Access (RBAC)**: Specialized dashboards for Citizens, Panchayat, NCCR (Admin), and NGOs.
- **Land Registry**: Mandatory land document verification by local authorities before plantation registration.

### 🌳 Plantation Management & MRV
- **Project Tracking**: Register plantations with precise GPS coordinates and species details.
- **Scientific Carbon Engine**: Automated biomass and CO₂ sequestration calculations based on species-specific factors.
- **Multi-Level Verification**: A robust workflow from Local Panchayat approval to National Coordinator (NCCR) finalization.

### ⛓️ Blockchain-Powered Transparency
- **Immutable Audit Trail**: Every plantation record is hashed and stored on the Ethereum/Polygon blockchain.
- **ERC-20 Carbon Tokens**: Verified CO₂ sequestration is converted into **Blue Carbon Credits (BCC)** tokens.
- **Zero Fraud**: Prevents double-counting and data tampering through decentralized consensus.

### 📊 Real-time Monitoring & Marketplace
- **Dynamic Dashboards**: Interactive maps (Leaflet.js) and analytical growth charts (Recharts).
- **Health Checks**: Annual survival rate tracking and periodic carbon recalculation.
- **Carbon Marketplace**: A decentralized platform for buying and selling verified carbon credits.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Framer Motion, React-Leaflet, Recharts |
| **Backend** | Node.js, Express.js, JWT, Nodemailer, Multer |
| **Database** | MongoDB (Mongoose), Cloudinary (Image Storage) |
| **Blockchain** | Solidity, Ethers.js, ERC-20 Standard, Polygon Amoy Testnet |
| **Security** | bcrypt, Rate Limiting, CORS, Input Sanitization |

---

## 📁 Project Structure

```text
blue-carbon-registry/
├── backend/            # Express API, Blockchain logic, Models
├── frontend/           # React SPA, Tailwind styles, Dashboards
├── contracts/          # Solidity Smart Contracts (Hardhat)
├── api/                # Vercel serverless functions (if any)
└── scripts/            # Utility scripts for seeding and testing
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Polygon Amoy Testnet RPC & Wallet (for blockchain)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI, CLOUDINARY_URL, and NCCR_WALLET_PRIVATE_KEY
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000/api
npm start
```

---

## 🔄 The Verification Workflow

1.  **Submission**: Citizen submits plantation data + GPS + Photos.
2.  **Local Audit**: Panchayat verifies the site and confirms tree counts.
3.  **Calculation**: System calculates CO₂eq sequestered.
4.  **Blockchain**: Data is hashed and recorded on-chain.
5.  **Tokenization**: BCC Tokens are minted to the Citizen's wallet.

---

## 🛡️ Security
- **JWT Session Management**: Tokens stored in HTTP-only cookies.
- **Audit Logs**: Every system action is recorded with a user-stamped trail.
- **Rate Limiting**: Protects against Brute Force and OTP spam.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support
For any queries, please reach out to the project maintainers or open an issue in the repository.

*Built with ❤️ for a Greener Planet.*
