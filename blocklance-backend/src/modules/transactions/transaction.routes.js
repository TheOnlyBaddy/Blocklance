import express from 'express';
import { fundEscrow, releaseEscrowTx, getProjectTransactions, saveTransaction } from './transaction.controller.js';
import { authAny } from '../../middlewares/authAny.js';
import { roleCheck } from '../../middlewares/roleCheck.js';

const router = express.Router();

router.get('/test', (_req, res) => res.status(200).json({ ok: true }));

router.post('/fund', authAny, roleCheck('client'), fundEscrow);
router.post('/:id/release', authAny, roleCheck('client'), releaseEscrowTx);
router.get('/project/:projectId', authAny, roleCheck('client', 'freelancer'), getProjectTransactions);
router.post('/save', authAny, roleCheck('client'), saveTransaction);

export default router;
