import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';
import { 
  getStats, getAnalytics, getUsers, createUser, deleteUser, updateUserRole,
  getCertificateTypes, createCertificateType, updateCertificateType, deleteCertificateType
} from '../controllers/adminController.js';
const router = express.Router();
router.use(verifyToken, authorizeRoles('Admin'));
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.get('/certificates', getCertificateTypes);
router.post('/certificates', createCertificateType);
router.put('/certificates/:id', updateCertificateType);
router.delete('/certificates/:id', deleteCertificateType);
export default router;
