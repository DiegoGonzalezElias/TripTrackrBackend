import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { deleteUserAcc, getUserMaps, updateUserMaps, changeUserPassword } from '../user/controllers';

const router = Router();

router.post('/update-user-map-list', requireAuth, updateUserMaps);
router.get('/user-maps', requireAuth, getUserMaps);
router.delete('/user-acc', requireAuth, deleteUserAcc);
router.put('/password', requireAuth, changeUserPassword);

export default router;