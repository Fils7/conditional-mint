require('dotenv').config();
const { ethers } = require("ethers");
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const contractABI = require('../artifacts/contracts/ConditionalMint.sol/Conditional.json');

const app = express();
app.use(cors());    
app.use(express.json());

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

const purchaseStatus = {};

contract.on("PurchaseCreated", async (buyer, value, event) => {
  const txHash = event.log.transactionHash;
  purchaseStatus[txHash] = { status: "pending", buyer };
  console.log("PurchaseCreated event received:", { buyer, value, txHash: event.logtransactionHash });


  // Simulate approval (random)
  const approved = Math.random() > 0.5;

  if (approved) {
    // Upload metadata to IPFS (Pinata)
    const metadata = {
      name: "Conditional NFT",
      description: "Minted after approval!",
      image: "ipfs://<your_image_cid>" // Replace with actual CID or logic
    };
    try {
      const pinataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        { headers: { Authorization: process.env.PINATA_JWT } }
      );
      const tokenURI = `ipfs://${pinataRes.data.IpfsHash}`;

      // Mint NFT
      const tx = await contract.safeMint(buyer, tokenURI);
      await tx.wait();
      purchaseStatus[txHash] = { status: "approved", tokenURI };
    } catch (err) {
      purchaseStatus[txHash] = { status: "mint_failed", error: err.message };
    }
  } else {
    // Refund
    try {
      const tx = await contract.refund(buyer, value);
      await tx.wait();
      purchaseStatus[txHash] = { status: "rejected" };
    } catch (err) {
      purchaseStatus[txHash] = { status: "refund_failed", error: err.message };
    }
  }
});

app.get('/status/:txHash', (req, res) => {
  const status = purchaseStatus[req.params.txHash];
  if (status) return res.json(status);
  res.status(404).json({ status: "not_found" });
});

app.listen(3001, () => console.log("Backend running on port 3001"));
