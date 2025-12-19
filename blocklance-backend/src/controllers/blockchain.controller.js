import { ethers } from 'ethers';
import Project from '../modules/projects/project.model.js';
import Transaction from '../modules/transactions/transaction.model.js';
// Hardcoded ABI for BlocklanceEscrow
const escrowABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_client", "type": "address"},
      {"internalType": "address",
        "name": "_freelancer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      }
    ],
    "stateMutability": "payable",
    "type": "constructor"
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
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "amount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "client",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "freelancer",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "funded",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "projectId",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "released",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const fundEscrow = async (req, res) => {
  try {
    console.log('Fund escrow request received:', { body: req.body });
    const { projectId, amount, clientAddress } = req.body;
    
    if (!projectId || amount === undefined || !clientAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: { 
          projectId: !projectId, 
          amount: amount === undefined,
          clientAddress: !clientAddress
        }
      });
    }

    // Validate client address format
    if (!ethers.isAddress(clientAddress)) {
      return res.status(400).json({
        error: 'Invalid client address format',
        details: { clientAddress }
      });
    }
    
    if (!process.env.BLOCKCHAIN_RPC_URL) {
      return res.status(500).json({
        error: 'Server configuration error',
        details: 'BLOCKCHAIN_RPC_URL not configured'
      });
    }

    try {
      console.log('Fetching project details...');
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          details: { projectId }
        });
      }

      // Verify the client matches the project's client
      if (project.clientId.toString() !== req.user.id) {
        return res.status(403).json({
          error: 'Unauthorized',
          details: 'Only the project client can fund the escrow'
        });
      }

      console.log('Connecting to blockchain provider...');
      const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      const network = await provider.getNetwork();
      console.log('Connected to network:', {
        name: network.name,
        chainId: network.chainId,
        ensAddress: network.ensAddress
      });

      if (!process.env.ESCROW_CONTRACT_ADDRESS) {
        throw new Error('ESCROW_CONTRACT_ADDRESS is not configured in environment variables');
      }
      console.log('Using contract address:', process.env.ESCROW_CONTRACT_ADDRESS);

      console.log('Creating contract instance...');
      // Create a signer using the client's address
      const clientSigner = await provider.getSigner(clientAddress);
      
      const escrowContract = new ethers.Contract(
        process.env.ESCROW_CONTRACT_ADDRESS,
        escrowABI,
        clientSigner
      );

      console.log('Sending transaction...');
      const value = ethers.parseEther(amount.toString());
      console.log('Transaction details:', { 
        from: clientAddress,
        to: process.env.ESCROW_CONTRACT_ADDRESS,
        amount: amount,
        value: value.toString() 
      });
      
      // Send transaction from client's address
      const tx = await escrowContract.fundEscrow({
        value: value,
        from: clientAddress
      });
      
      console.log('Transaction sent, waiting for confirmation...');
      console.log('Transaction hash:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      console.log('Updating database...');
      await Promise.all([
        Project.findByIdAndUpdate(projectId, { 
          escrowFunded: true,
          escrowAddress: process.env.ESCROW_CONTRACT_ADDRESS,
          escrowTxHash: tx.hash
        }),
        Transaction.create({
          projectId,
          type: 'fund',
          amount,
          txHash: tx.hash,
          from: clientAddress,
          to: process.env.ESCROW_CONTRACT_ADDRESS,
          status: 'completed'
        })
      ]);
      console.log('Database updated successfully');

      return res.json({ 
        success: true, 
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        escrowAddress: process.env.ESCROW_CONTRACT_ADDRESS
      });
      
    } catch (blockchainError) {
      console.error('Blockchain error:', {
        name: blockchainError.name,
        message: blockchainError.message,
        code: blockchainError.code,
        stack: blockchainError.stack
      });
      
      if (blockchainError.code === 'INSUFFICIENT_FUNDS') {
        return res.status(400).json({
          error: 'Insufficient funds',
          details: 'The wallet does not have enough ETH to cover the transaction cost'
        });
      }
      
      if (blockchainError.code === 'NETWORK_ERROR' || blockchainError.code === 'TIMEOUT') {
        return res.status(503).json({
          error: 'Blockchain network error',
          details: 'Failed to connect to the blockchain network',
          code: blockchainError.code
        });
      }
      
      throw blockchainError; // Re-throw to be caught by outer catch
    }
    
  } catch (error) {
    console.error('Unexpected error in fundEscrow:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({ 
      error: 'Failed to process escrow funding',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: error.code
    });
  }
};
