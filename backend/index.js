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
const purchaseMetadata = {}; // Store metadata by txHash

app.post('/purchase-metadata', (req, res) => {
  const { txHash, name, image } = req.body;
  if (!txHash || !name || !image) {
    return res.status(400).json({ error: 'txHash, name, and image are required' });
  }
  purchaseMetadata[txHash] = { name, image };
  res.json({ status: 'ok' });
});

contract.on("PurchaseCreated", async (buyer, value, event) => {
  const txHash = event.log.transactionHash;
  purchaseStatus[txHash] = { status: "pending", buyer };
  console.log("PurchaseCreated event received:", { buyer, value, txHash });

  try {
    // Simulate approval (random)
    const approved = Math.random() > 0.5;
    console.log("Approval result:", approved);

    if (approved) {
      console.log("Uploading metadata to Pinata...");
      // Use dynamic metadata if available
      const meta = purchaseMetadata[txHash] || {};
      const metadata = {
        name: meta.name || "Conditional NFT",
        description: "Minted after approval!",
        image: meta.image || "ipfs://<your_image_cid>"
      };
      let tokenURI;
      try {
        const pinataRes = await axios.post(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          metadata,
          { headers: { Authorization: process.env.PINATA_JWT } }
        );
        tokenURI = `ipfs://${pinataRes.data.IpfsHash}`;
        console.log("Pinata upload complete, tokenURI:", tokenURI);
      } catch (err) {
        console.error("Pinata upload failed:", err);
        purchaseStatus[txHash] = { status: "mint_failed", error: "Pinata upload failed: " + err.message };
        return;
      }
      try {
        console.log("Minting NFT...");
        const tx = await contract.safeMint(buyer, tokenURI);
        await tx.wait();
        purchaseStatus[txHash] = { status: "approved", tokenURI };
        console.log("Minting complete.");
        // Log NFT balance of the buyer
        const buyerBalance = await contract.balanceOf(buyer);
        console.log(`NFT balance of ${buyer}: ${buyerBalance.toString()}`);
      } catch (err) {
        console.error("Minting failed:", err);
        purchaseStatus[txHash] = { status: "mint_failed", error: err.message };
      }
    } else {
      try {
        console.log("Refunding...");
        const tx = await contract.refund(buyer, value);
        await tx.wait();
        purchaseStatus[txHash] = { status: "rejected" };
        console.log("Refund complete.");
      } catch (err) {
        console.error("Refund failed:", err);
        purchaseStatus[txHash] = { status: "refund_failed", error: err.message };
      }
    }
  } catch (err) {
    console.error("Error in event handler:", err);
    purchaseStatus[txHash] = { status: "error", error: err.message };
  }
});

app.get('/status/:txHash', (req, res) => {
  const status = purchaseStatus[req.params.txHash];
  if (status) return res.json(status);
  res.status(404).json({ status: "not_found" });
});

app.listen(3001, () => console.log("Backend running on port 3001"));
