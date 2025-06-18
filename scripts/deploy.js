const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Conditional = await hre.ethers.getContractFactory("Conditional");
  const platformWalletAddress = "0xcd3B766CCDd6AE721141F452C550Ca635964ce71";
  const conditional = await Conditional.deploy(platformWalletAddress, platformWalletAddress);

  await conditional.waitForDeployment();

  console.log("Conditional deployed to:", await conditional.getAddress());

  const buyerAddress = deployer.address; // Or the address you used for purchase
  const nftBalance = await conditional.balanceOf(buyerAddress);
  console.log(`NFT balance of ${buyerAddress}: ${nftBalance.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
