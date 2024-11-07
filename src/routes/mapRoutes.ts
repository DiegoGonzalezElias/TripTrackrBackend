import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { createMap, deleteMap, getMarkers, selectMap, updateMap } from '../map/contollers';

const router = Router();

router.post('/create-map', requireAuth, createMap);
router.delete('/delete-map', requireAuth, deleteMap);
router.post('/update-map', requireAuth, updateMap);
router.get('/get-all-markers', requireAuth, getMarkers);
router.post('/select-map', requireAuth, selectMap);

export default router;