// scripts/purchase.js
require('dotenv').config();
const { ethers } = require("ethers");
const contractABI = require("../artifacts/contracts/ConditionalMint.sol/Conditional.json");
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI.abi, wallet);

async function main() {
  const tx = await contract.purchase({ value: ethers.parseEther("0.01") });
  console.log("Purchase tx sent:", tx.hash);
  await tx.wait();
  console.log("Purchase confirmed!");
}

main().catch(console.error);