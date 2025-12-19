import express from 'express';
import multer from 'multer';
import { raiseDispute, resolveDispute, getProjectDisputes } from './dispute.controller.js';
import { authAny } from '../../middlewares/authAny.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Lightweight health check for frontend verifier
router.get('/test', (_req, res) => res.status(200).json({ ok: true }));

router.post('/', authAny, upload.array('attachments', 5), raiseDispute);
router.get('/project/:projectId', authAny, getProjectDisputes);
router.post('/:id/resolve', authAny, resolveDispute);

export default router;
