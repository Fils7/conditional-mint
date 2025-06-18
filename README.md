### Addresses:
Conditional Mint: 0x6e1E89E22841657499c494fb98e86E78237C9e3c


## Conditional Mint
A full-stack Web3 application for conditional NFT minting after purchase approval, using Solidity, Node.js, React, and IPFS (Pinata).
Deployed on Base Testnet (Base Sepolia).


### 📦 Project Structure

```javascript
contracts/      # Solidity smart contracts
backend/        # Node.js backend (event listener, approval logic, IPFS upload)
frontend/       # React frontend (user interface, wallet connection)
scripts/        # Deployment and interaction scripts
```

## 🚀 Quick Start

1. Clone the Repository

```javascript
git clone <your-repo-url>
cd conditional-mint
```

2. Install Dependencies

```javascript
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Environment Variables
Backend (backend/.env)

```javascript
BASE_RPC_URL=http://127.0.0.1:8545         # Or your Base Sepolia RPC URL
PRIVATE_KEY=0x...                          # Private key of the contract owner/platform wallet
CONTRACT_ADDRESS=0x...                     # Deployed contract address
PINATA_JWT=Bearer <your-pinata-jwt>        # Pinata JWT for IPFS uploads
```

Frontend (frontend/.env.local)

```javascript
REACT_APP_CONTRACT_ADDRESS=0x...           # Deployed contract address
```

4. Deploment
Start a local Hardhat node (for local testing):

```javascript
npx hardhat node
```

Deploy the contract:

```javascript
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address to your .env files.

5. Run the Backend

```javascript
node index.js
```

6. Run the Frontend

```javascript
npm start
```