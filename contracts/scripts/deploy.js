import hre from "hardhat";

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Deploy CarbonCreditToken
  console.log("\n📝 Deploying CarbonCreditToken...");
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const carbonToken = await CarbonCreditToken.deploy();
  await carbonToken.waitForDeployment();
  const carbonTokenAddr = await carbonToken.getAddress();
  console.log("✅ CarbonCreditToken deployed to:", carbonTokenAddr);

  // Deploy PlantationRegistry
  console.log("\n📝 Deploying PlantationRegistry...");
  const PlantationRegistry = await hre.ethers.getContractFactory("PlantationRegistry");
  const plantationRegistry = await PlantationRegistry.deploy(carbonTokenAddr);
  await plantationRegistry.waitForDeployment();
  const registryAddr = await plantationRegistry.getAddress();
  console.log("✅ PlantationRegistry deployed to:", registryAddr);

  // Add PlantationRegistry as minter
  console.log("\n🔧 Setting up permissions...");
  await carbonToken.addMinter(registryAddr);
  console.log("✅ PlantationRegistry added as minter");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      CarbonCreditToken: {
        address: carbonTokenAddr,
        name: "CarbonCreditToken",
        symbol: "BCC"
      },
      PlantationRegistry: {
        address: registryAddr,
        name: "PlantationRegistry"
      }
    }
  };

  console.log("\n📊 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
