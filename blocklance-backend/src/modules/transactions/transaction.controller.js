import Transaction from './transaction.model.js';
import Project from '../projects/project.model.js';
import { createEscrow, releaseEscrow as releaseEscrowOnChain } from '../blockchain/blockchain.service.js';
import Notification from '../notifications/notification.model.js';
import { User } from '../users/user.model.js';
import { emitEvent } from '../../server.js';
import mongoose from 'mongoose';

export const fundEscrow = async (req, res) => {
  try {
    const { projectId, freelancerId, amountEth } = req.body || {};
    const clientId = req.user.id || req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'in_progress')
      return res.status(400).json({ message: 'Project not active for funding' });
    if (project.clientId.toString() !== clientId)
      return res.status(403).json({ message: 'Unauthorized: Not project owner' });

    const payeeId = freelancerId || project.assignedFreelancer?.toString();
    if (!payeeId) return res.status(400).json({ message: 'Missing freelancerId/assignedFreelancer' });

    const freelancer = await User.findById(payeeId).select('walletAddress');
    if (!freelancer || !freelancer.walletAddress) {
      return res.status(400).json({ message: 'Freelancer walletAddress not set' });
    }

    const { txHash, dealId } = await createEscrow(freelancer.walletAddress, Number(amountEth));

    const transaction = await Transaction.create({
      projectId,
      payer: clientId,
      payee: payeeId,
      amount: Number(amountEth),
      txHash,
      dealId,
      status: 'funded',
    });

    await Notification.create({
      receiver: payeeId,
      type: 'payment',
      message: `Escrow funded for project "${project.title || project._id}"`,
      projectId,
      relatedUser: clientId,
    });

    // Realtime event to freelancer (payee)
    emitEvent('transaction:update', payeeId, {
      message: `Escrow funded for project "${project.title || project._id}"`,
      txHash: transaction.txHash,
      dealId: transaction.dealId,
      status: transaction.status,
      projectId,
    });

    return res.status(201).json({ message: 'Escrow funded successfully', transaction });
  } catch (err) {
    console.error('Fund escrow error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const releaseEscrowTx = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate('projectId');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    const clientId = req.user.id || req.user.userId;

    // Only the project client can release on-chain per contract rules
    const project = await Project.findById(transaction.projectId._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.clientId.toString() !== clientId) {
      return res.status(403).json({ message: 'Unauthorized: Not project owner' });
    }
    if (transaction.status !== 'funded') {
      return res.status(400).json({ message: 'Escrow not yet funded' });
    }

    const { txHash } = await releaseEscrowOnChain(transaction.dealId);

    transaction.status = 'released';
    transaction.releasedAt = new Date();
    transaction.txHash = txHash;
    await transaction.save();

    if (project) {
      project.status = 'completed';
      await project.save();
    }

    await Notification.create({
      receiver: transaction.payee,
      type: 'payment',
      message: 'Payment released successfully.',
      projectId: transaction.projectId,
    });

    // Realtime event to freelancer (payee)
    emitEvent('transaction:update', transaction.payee.toString(), {
      message: `Escrow released for project "${project?.title || transaction.projectId}"`,
      txHash,
      dealId: transaction.dealId,
      status: transaction.status,
      projectId: transaction.projectId,
    });

    return res.status(200).json({ message: 'Funds released on-chain', transaction });
  } catch (err) {
    console.error('Release escrow error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectTransactions = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }
    const txs = await Transaction.find({ projectId })
      .populate('payer', 'username email')
      .populate('payee', 'username email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ transactions: txs });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save an on-chain transaction hash for a project payment
export const saveTransaction = async (req, res) => {
  try {
    const { projectId, amount, freelancerId } = req.body || {};
    const txHash = req.body?.txHash || req.body?.hash;
    if (!projectId || !txHash || typeof amount !== 'number') {
      return res.status(400).json({ message: 'projectId, txHash and numeric amount are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const clientId = req.user.id || req.user.userId;
    if (project.clientId.toString() !== clientId) return res.status(403).json({ message: 'Unauthorized' });

    const tx = await Transaction.create({
      projectId,
      payer: clientId,
      payee: freelancerId || project.assignedFreelancer || undefined,
      amount,
      status: 'funded',
      txHash,
    });

    return res.status(201).json({ message: 'Transaction saved', transaction: tx });
  } catch (err) {
    console.error('Save tx error:', err);
    return res.status(500).json({ message: 'Failed to save transaction' });
  }
};

