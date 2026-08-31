import ethers from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EvidenceRegistry
  const EvidenceRegistry = await ethers.deployContract("EvidenceRegistry", [deployer.address]);
  await EvidenceRegistry.waitForDeployment();
  
  const address = await EvidenceRegistry.getAddress();
  console.log("EvidenceRegistry deployed to:", address);

  // Verify deployment
  const admin = await EvidenceRegistry.admin();
  console.log("Admin address:", admin);
  console.log("Deployer is admin:", admin.toLowerCase() === deployer.address.toLowerCase());

  console.log("\nDeployment completed successfully!");
  console.log("\nNext steps:");
  console.log("1. Update your .env file with CONTRACT_ADDRESS=" + address);
  console.log("2. Start the blockchain service: cd service && npm run dev");
  console.log("3. Test the service: curl http://localhost:3001/api/v1/blockchain/health");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
