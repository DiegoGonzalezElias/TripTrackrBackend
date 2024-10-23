import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { deleteUser, getUserMaps, updateUserMaps } from '../user/controllers';

const router = Router();

router.post('/update-user-map-list', requireAuth, updateUserMaps);
router.get('/user-maps', requireAuth, getUserMaps);
router.delete('/delete-user', requireAuth, deleteUser);

export default router;