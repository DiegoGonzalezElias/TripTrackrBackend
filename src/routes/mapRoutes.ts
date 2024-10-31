import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { createMap, deleteMap, getMarkers, updateMap } from '../map/contollers';

const router = Router();

router.post('/create-map', requireAuth, createMap);
router.post('/delete-map', requireAuth, deleteMap);
router.post('/update-map', requireAuth, updateMap);
router.get('/get-all-markers', requireAuth, getMarkers);

export default router;