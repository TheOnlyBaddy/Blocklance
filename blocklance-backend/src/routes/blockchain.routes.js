import express from 'express';
import { fundEscrow } from '../controllers/blockchain.controller.js';

const router = express.Router();

router.post('/fund', fundEscrow);

export default router;
