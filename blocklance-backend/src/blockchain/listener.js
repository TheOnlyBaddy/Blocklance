import { ethers } from "ethers";
import dotenv from "dotenv";
import Project from "../modules/projects/project.model.js";
import Transaction from "../modules/transactions/transaction.model.js";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");
// Hardcoded ABI for BlocklanceEscrow
const escrowABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "client",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      }
    ],
    "name": "Funded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "freelancer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      }
    ],
    "name": "Released",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "amount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "client",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freelancer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fundEscrow",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "funded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectId",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "released",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ESCROW_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

export const initEscrowListener = async () => {
  try {
    if (!ESCROW_ADDRESS) {
      console.log("⚠️  ESCROW_CONTRACT_ADDRESS not set in .env. Event listening disabled.");
      return;
    }

    const contract = new ethers.Contract(ESCROW_ADDRESS, escrowABI.abi, provider);
    console.log("🔗 Listening for Escrow Events...");

    // --- Fund Event ---
    contract.on("Funded", async (client, amount, projectId, event) => {
      console.log(`💰 Escrow Funded: ${ethers.formatEther(amount)} ETH for project ${projectId}`);

      try {
        await Transaction.create({
          projectId,
          type: "fund",
          amount: ethers.formatEther(amount),
          txHash: event.log.transactionHash,
          from: client,
        });

        await Project.findByIdAndUpdate(projectId, { escrowFunded: true });
        console.log("✅ Project + Transaction updated.");
      } catch (error) {
        console.error("❌ Error processing Funded event:", error);
      }
    });

    // --- Released Event ---
    contract.on("Released", async (freelancer, amount, projectId, event) => {
      console.log(`🚀 Escrow Released: ${ethers.formatEther(amount)} ETH to freelancer ${freelancer}`);

      try {
        await Transaction.create({
          projectId,
          type: "release",
          amount: ethers.formatEther(amount),
          txHash: event.log.transactionHash,
          to: freelancer,
        });

        await Project.findByIdAndUpdate(projectId, { 
          escrowReleased: true, 
          status: "Completed" 
        });
        console.log("✅ Project status marked Completed.");
      } catch (error) {
        console.error("❌ Error processing Released event:", error);
      }
    });

    console.log(`✅ Escrow listener active for contract: ${ESCROW_ADDRESS}`);
  } catch (error) {
    console.error("❌ Escrow listener error:", error);
  }
};
