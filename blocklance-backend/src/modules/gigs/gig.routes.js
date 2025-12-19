import express from 'express';
import { createProject, getClientProjects, getAllAvailableProjects, updateProjectStatus } from '../projects/project.controller.js';
import { authAny } from '../../middlewares/authAny.js';
import { roleCheck } from '../../middlewares/roleCheck.js';

const router = express.Router();

// Alias routes for backward-compat with frontend expecting "/gigs"
router.post('/', authAny, roleCheck('freelancer'), createProject);
router.get('/my-gigs', authAny, roleCheck('freelancer', 'admin'), getClientProjects);
router.get('/available', authAny, roleCheck('freelancer'), getAllAvailableProjects);
router.patch('/:id/status', authAny, roleCheck('client'), updateProjectStatus);

export default router;
