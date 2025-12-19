import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = provider.getSigner(0); // first local account

// Import ABI from artifacts (will be generated after first deployment)
import escrowABI from "../../artifacts/contracts/BlocklanceEscrow.sol/BlocklanceEscrow.json" assert { type: "json" };
const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;

export const storeHash = async (req, res) => {
  try {
    const contract = new ethers.Contract(ESCROW_ADDRESS, escrowABI.abi, signer);
    const tx = await contract.fundEscrow({ value: ethers.parseEther("0.1") });
    await tx.wait();
    res.json({ message: "Transaction success", txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction failed" });
  }
};
