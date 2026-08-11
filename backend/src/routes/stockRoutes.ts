import { Router } from 'express';
import { getStockMovements, adjustStock } from '../controllers/stockController';
import { authenticateJwt, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJwt);

router.get('/', getStockMovements);
router.post('/adjust', requireRole([Role.ADMIN, Role.WAREHOUSE]), adjustStock);

export default router;
