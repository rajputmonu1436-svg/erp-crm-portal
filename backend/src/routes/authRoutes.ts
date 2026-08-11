import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateJwt, getMe);

export default router;
