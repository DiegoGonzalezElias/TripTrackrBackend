import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { createMap, deleteMap } from '../map/contollers';

const router = Router();

router.post('/create-map', requireAuth, createMap);
router.post('/delete-map', requireAuth, deleteMap);

export default router;