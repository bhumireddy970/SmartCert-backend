import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import Notification from '../models/Notification.js';
const router = express.Router();
router.use(verifyToken);
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/mark-all/read', async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
export default router;
