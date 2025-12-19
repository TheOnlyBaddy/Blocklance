import express from 'express';
import multer from 'multer';
import { authAny } from '../../middlewares/authAny.js';
import { roleCheck } from '../../middlewares/roleCheck.js';
import {
  createPortfolio,
  getMyPortfolio,
  getUserPortfolio,
  updatePortfolio,
  deletePortfolio,
} from './portfolio.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authAny, roleCheck('freelancer'), upload.single('image'), createPortfolio);
router.get('/me', authAny, roleCheck('freelancer'), getMyPortfolio);
router.get('/user/:id', authAny, getUserPortfolio);
router.put('/:id', authAny, roleCheck('freelancer'), upload.single('image'), updatePortfolio);
router.delete('/:id', authAny, roleCheck('freelancer'), deletePortfolio);

export default router;
