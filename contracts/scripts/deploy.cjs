const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Blue Carbon Registry contracts to", hre.network.name, "...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // 1. Deploy CarbonCreditToken (BCC)
  console.log("\n📝 Deploying CarbonCreditToken (BCC)...");
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const token = await CarbonCreditToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ CarbonCreditToken deployed to:", tokenAddress);

  // 2. Deploy PlantationRegistry (NCCR backend will be owner; same wallet can own both)
  console.log("\n📝 Deploying PlantationRegistry...");
  const PlantationRegistry = await hre.ethers.getContractFactory("PlantationRegistry");
  const registry = await PlantationRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ PlantationRegistry deployed to:", registryAddress);

  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      CarbonCreditToken: {
        address: tokenAddress,
        name: "Blue Carbon Credit",
        symbol: "BCC",
      },
      PlantationRegistry: {
        address: registryAddress,
      },
    },
  };

  console.log("\n📊 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n⚠️  Add these to backend .env:");
  console.log("CARBON_CREDIT_TOKEN_ADDRESS=" + tokenAddress);
  console.log("PLANTATION_REGISTRY_ADDRESS=" + registryAddress);
  console.log("NCCR_WALLET_PRIVATE_KEY=<deployer_private_key>");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
