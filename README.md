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

```bash
git clone https://github.com/Fils7/conditional-mint.git
cd conditional-mint
```

2. Install Dependencies

```bash
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

**Instructions:**
- Each user should copy the example files to `.env`/`.env.local` and fill in their own values.
- For Base Sepolia, use a wallet you control and fund it with testnet ETH from a faucet.
- The deployer account (PRIVATE_KEY) will be the contract owner and must have Base Sepolia ETH.
- The backend should use the same private key as the contract owner to be able to mint/refund.

4. Deployment
Start a local Hardhat node (for local testing):

```bash
npx hardhat node
```

Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address to your .env files.

5. Run the Backend

```bash
cd backend
node index.js
```

6. Run the Frontend

```bash
cd frontend
npm start
```

## 📝 Notes
- Do **not** commit real secrets or private keys.
- Each collaborator should use their own wallet and Pinata JWT for testing.
- For Base Sepolia, use the official faucet or QuickNode/Alchemy faucets to get testnet ETH.
- The backend and frontend must use the same contract address and network.

## 📄 Example Addresses

```
Conditional Mint: 0x6e1E89E22841657499c494fb98e86E78237C9e3c
```

## 📚 License

MIT