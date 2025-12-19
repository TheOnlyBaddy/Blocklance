import express from 'express';
import { createBid, getProjectBids, acceptBid } from './bid.controller.js';
import { authAny } from '../../middlewares/authAny.js';
import { roleCheck } from '../../middlewares/roleCheck.js';

const router = express.Router();

// Lightweight health check for frontend verifier
router.get('/test', (_req, res) => res.status(200).json({ ok: true }));

router.post('/', authAny, roleCheck('freelancer'), createBid);
router.get('/:id', authAny, roleCheck('client', 'freelancer'), getProjectBids);
router.post('/:bidId/accept', authAny, roleCheck('client'), acceptBid);

export default router;
