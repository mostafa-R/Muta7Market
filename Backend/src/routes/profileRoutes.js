

import express from 'express';
import { getProfiles, addProfile } from '../controllers/profileController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', getProfiles);
router.post('/', authMiddleware, addProfile);

export default router;
