import { Router } from 'express';
import { register, login, refreshToken, logout } from '../auth/controllers';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Ejemplo de una ruta protegida
router.get('/protected', requireAuth, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.user?.userId });
});

export default router;
