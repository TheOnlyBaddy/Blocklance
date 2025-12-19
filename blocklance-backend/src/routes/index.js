import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import projectRoutes from '../modules/projects/project.routes.js';
import bidRoutes from '../modules/bids/bid.routes.js';
import transactionRoutes from '../modules/transactions/transaction.routes.js';
import reviewRoutes from '../modules/reviews/review.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import disputeRoutes from '../modules/disputes/dispute.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import portfolioRoutes from '../modules/portfolio/portfolio.routes.js';
import gigRoutes from '../modules/gigs/gig.routes.js';
import messageRoutes from '../modules/messages/message.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/bids', bidRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/disputes', disputeRoutes);
router.use('/users', userRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/gigs', gigRoutes);
router.use('/messages', messageRoutes);

export default router;

