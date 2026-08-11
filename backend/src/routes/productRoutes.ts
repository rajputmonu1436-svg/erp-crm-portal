import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
} from '../controllers/productController';
import { authenticateJwt, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJwt);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireRole([Role.ADMIN, Role.WAREHOUSE]), createProduct);
router.put('/:id', requireRole([Role.ADMIN, Role.WAREHOUSE]), updateProduct);

export default router;
