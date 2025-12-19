import express from 'express';
import { createNotification, getMyNotifications, markAsRead } from './notification.controller.js';
import { authAny } from '../../middlewares/authAny.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authAny, createNotification);
router.get('/me', authMiddleware, getMyNotifications);
router.post('/:id/read', authAny, markAsRead);

export default router;
