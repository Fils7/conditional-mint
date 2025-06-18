const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Conditional = await hre.ethers.getContractFactory("Conditional");
  const platformWalletAddress = "0x715Ef5E2Bc1DF1442f90836Bf2974d6Dd90c7CB9";
  const conditional = await Conditional.deploy(platformWalletAddress, platformWalletAddress);

  await conditional.waitForDeployment();

  console.log("Conditional deployed to:", await conditional.getAddress());

  // After deployment, you can check balances or other contract states
  // For example, let's check the balance of the deployer (who is also the buyer for this test)
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
