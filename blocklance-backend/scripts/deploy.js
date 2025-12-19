import hre from "hardhat";

async function main() {
  const Escrow = await hre.ethers.getContractFactory("BlocklanceEscrow");
  
  // Example project ID - replace with actual project ID from your database
  const projectId = "sample-project-123";
  
  const escrow = await Escrow.deploy(
    "0x0000000000000000000000000000000000000001", // client address
    "0x0000000000000000000000000000000000000002", // freelancer address
    projectId,
    { value: hre.ethers.parseEther("0.5") }
  );
  
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  
  console.log(`✅ Escrow deployed at ${escrowAddress}`);
  console.log(`🔗 Project ID: ${projectId}`);
  console.log(`💡 Update your .env file with: ESCROW_CONTRACT_ADDRESS=${escrowAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
