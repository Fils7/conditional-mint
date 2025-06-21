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

## 🏦 Platform Wallet Setup

**Important:** You need to choose a platform wallet address before deploying the contract. This wallet will be used for:

- **Contract Ownership**: The platform wallet becomes the contract owner with minting and refund permissions
- **Backend Operations**: The backend uses this wallet's private key to mint NFTs and process refunds
- **Future Features**: Platform fees and revenue distribution (if implemented)

### How to Choose Your Platform Wallet:

1. **Create a new wallet** specifically for this project (recommended for security)
2. **Use an existing wallet** you control (make sure you have the private key)
3. **Use a hardware wallet** (ensure it's compatible with Base Sepolia)

### Platform Wallet Requirements:

- ✅ Must be a valid Ethereum address
- ✅ Must have the private key accessible for backend operations
- ✅ Should be funded with Base Sepolia ETH for gas fees
- ✅ Should be different from your personal wallet for security

### Example Platform Wallet Setup:

```javascript
// In scripts/deploy.js or ignition/modules/ConditionalMint.ts
const platformWalletAddress = "YourPlatformWalletAddress";
const conditional = await Conditional.deploy(platformWalletAddress, platformWalletAddress);
```

**Note:** Currently, the platform wallet is set but not actively used for fee collection. It serves as the contract owner and backend operator wallet.

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
PRIVATE_KEY=0x...                          # Private key of the platform wallet (contract owner)
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
- The **PRIVATE_KEY** must be the private key of your chosen platform wallet (the contract owner).
- The platform wallet must have Base Sepolia ETH for gas fees (minting and refunding operations).
- The backend uses this private key to mint NFTs and process refunds on behalf of the platform.

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