import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallanStatus,
  downloadChallanPDF,
} from '../controllers/challanController';
import { authenticateJwt, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJwt);

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.get('/:id/pdf', downloadChallanPDF);
router.post('/', requireRole([Role.ADMIN, Role.SALES]), createChallan);
router.put('/:id/status', requireRole([Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS]), updateChallanStatus);

export default router;
