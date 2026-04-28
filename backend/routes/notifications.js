/**
 * Notifications API route
 * GET    /api/notifications             - Get user's notifications (paginated)
 * GET    /api/notifications/unread-count - Lightweight count for bell badge
 * PATCH  /api/notifications/:id/read   - Mark one as read
 * PATCH  /api/notifications/read-all   - Mark all as read
 */
import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/notifications/unread-count — lightweight poll for badge
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/notifications — paginated list (unread first, then by date)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ isRead: 1, createdAt: -1 })  // unread first, then newest
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: req.user.id }),
    ]);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({
      success: true,
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      unreadCount,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.json({ success: true, notification });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
