import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { updateUserMaps } from '../user/controllers';

const router = Router();

router.post('/update-user-map-list', requireAuth, updateUserMaps);

export default router;