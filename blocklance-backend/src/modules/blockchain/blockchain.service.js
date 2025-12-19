import { ethers } from 'ethers';
import dotenv from 'dotenv';
// Note: This path expects you to compile contracts with Hardhat to generate artifacts
// Adjust path if your build directory differs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let EscrowArtifact = { abi: [] };

dotenv.config();

const MODE = process.env.MODE || 'chain';

if (MODE !== 'mock') {
  try {
    EscrowArtifact = require('../../../blockchain/artifacts/contracts/Escrow.sol/Escrow.json');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Escrow artifact not found. Ensure contracts are compiled or set MODE=mock.');
  }
}

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

if (MODE !== 'mock' && (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS)) {
  // eslint-disable-next-line no-console
  console.warn('Blockchain env incomplete: set BLOCKCHAIN_RPC_URL, BLOCKCHAIN_PRIVATE_KEY, ESCROW_CONTRACT_ADDRESS');
}

const provider = MODE !== 'mock' && RPC_URL ? new ethers.JsonRpcProvider(RPC_URL) : null;
const wallet = MODE !== 'mock' && provider && PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;
const escrowContract = MODE !== 'mock' && wallet && CONTRACT_ADDRESS
  ? new ethers.Contract(CONTRACT_ADDRESS, EscrowArtifact.abi, wallet)
  : null;

export const createEscrow = async (freelancerAddress, amountEth) => {
  if (MODE === 'mock') {
    const txHash = ethers.hexlify(ethers.randomBytes(32));
    const dealId = Math.floor(Date.now() / 1000);
    return { txHash, dealId };
  }
  if (!escrowContract) throw new Error('Escrow contract not initialized');
  const tx = await escrowContract.createDeal(freelancerAddress, {
    value: ethers.parseEther(amountEth.toString()),
  });
  const receipt = await tx.wait();
  // Try to extract dealId from events
  let dealId = null;
  try {
    const iface = new ethers.Interface(EscrowArtifact.abi);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        if (parsed?.name === 'EscrowCreated') {
          dealId = Number(parsed.args[0]);
          break;
        }
      } catch (_) {}
    }
  } catch (_) {}
  return { txHash: receipt.hash || receipt.transactionHash, dealId };
};

export const releaseEscrow = async (dealId) => {
  if (MODE === 'mock') {
    const txHash = ethers.hexlify(ethers.randomBytes(32));
    return { txHash };
  }
  if (!escrowContract) throw new Error('Escrow contract not initialized');
  const tx = await escrowContract.releaseFunds(dealId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash || receipt.transactionHash };
};

export const cancelEscrow = async (dealId) => {
  if (MODE === 'mock') {
    const txHash = ethers.hexlify(ethers.randomBytes(32));
    return { txHash };
  }
  if (!escrowContract) throw new Error('Escrow contract not initialized');
  const tx = await escrowContract.cancelDeal(dealId);
  const receipt = await tx.wait();
  return { txHash: receipt.hash || receipt.transactionHash };
};

// Blockchain service with mock mode and future chain integration
// MODE=mock: returns stubbed data
// MODE=chain: placeholder for ethers.js integration

export async function createMockTx(payload = {}) {
  if ((process.env.MODE || 'mock') === 'mock') {
    return {
      hash: `0xmock${Math.random().toString(16).slice(2)}`,
      status: 'success',
      payload,
      createdAt: new Date().toISOString(),
    };
  }
  // TODO: Implement real transaction creation using ethers.js
  throw new Error('Real chain integration not implemented');
}

export async function getTxByHash(hash) {
  if ((process.env.MODE || 'mock') === 'mock') {
    return {
      hash,
      status: 'success',
      confirmations: 42,
      network: 'mocknet',
    };
  }
  // TODO: Implement real tx lookup using ethers.js Provider
  throw new Error('Real chain integration not implemented');
}



