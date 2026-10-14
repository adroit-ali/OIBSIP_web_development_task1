import express from 'express';
import {
  getAllInventory,
  updateInventoryItem,
  triggerLowStockCheck,
} from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User access for custom builder ingredients
router.get('/', getAllInventory);

// Admin-protected routes
router.put('/:id', protect, adminOnly, updateInventoryItem);
router.post('/check-alerts', protect, adminOnly, triggerLowStockCheck);

export default router;
