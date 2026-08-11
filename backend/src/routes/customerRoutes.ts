import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  addFollowUpNote,
} from '../controllers/customerController';
import { authenticateJwt, requireRole } from '../middleware/auth';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJwt);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', requireRole([Role.ADMIN, Role.SALES]), createCustomer);
router.put('/:id', requireRole([Role.ADMIN, Role.SALES]), updateCustomer);
router.post('/:id/follow-ups', requireRole([Role.ADMIN, Role.SALES]), addFollowUpNote);

export default router;
