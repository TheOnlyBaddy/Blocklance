import express from 'express';
import { authAny } from '../../middlewares/authAny.js';
import { createReview, getUserReviews, getProjectReviews } from './review.controller.js';

const router = express.Router();

router.post('/', authAny, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/project/:projectId', getProjectReviews);

export default router;
