import dbStore from '../models/store.js';
import { sendLowStockAlertEmail } from '../config/emailService.js';
import { getIO } from '../socket/socketHandler.js';

// Get all inventory grouped or full list
export const getAllInventory = async (req, res) => {
  try {
    const items = await dbStore.getAllInventory();

    // Grouping helper for convenience
    const grouped = {
      bases: items.filter((i) => i.category === 'base'),
      sauces: items.filter((i) => i.category === 'sauce'),
      cheeses: items.filter((i) => i.category === 'cheese'),
      vegetables: items.filter((i) => i.category === 'vegetable'),
    };

    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '20', 10);
    const lowStockCount = items.filter((i) => i.stock < (i.threshold || threshold)).length;

    return res.status(200).json({
      success: true,
      data: items,
      grouped,
      summary: {
        totalItems: items.length,
        lowStockCount,
        threshold,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory.',
      error: err.message,
    });
  }
};

// Update stock manually for an inventory item (Admin action)
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, threshold, delta } = req.body;

    const existingItem = await dbStore.findInventoryById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found.',
      });
    }

    let newStock = existingItem.stock;
    if (typeof stock === 'number') {
      newStock = Math.max(0, stock);
    } else if (typeof delta === 'number') {
      newStock = Math.max(0, existingItem.stock + delta);
    }

    const updatedItem = await dbStore.updateInventoryStock(id, newStock, threshold);

    // Emit live socket event for real-time stock update
    const io = getIO();
    if (io) {
      io.emit('inventory:updated', {
        item: updatedItem,
        updatedBy: req.user ? req.user.name : 'Admin',
      });
    }

    // Check if threshold breached
    const currentThreshold = updatedItem.threshold || parseInt(process.env.LOW_STOCK_THRESHOLD || '20', 10);
    let lowStockWarning = false;
    if (updatedItem.stock < currentThreshold) {
      lowStockWarning = true;
    }

    return res.status(200).json({
      success: true,
      message: `Stock updated for ${updatedItem.name} (${updatedItem.stock} ${updatedItem.unit || 'units'}).`,
      data: updatedItem,
      lowStockWarning,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update stock.',
      error: err.message,
    });
  }
};

// Check low stock and trigger email alert
export const triggerLowStockCheck = async (req, res) => {
  try {
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '20', 10);
    const lowStockItems = await dbStore.getLowStockItems(threshold);

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@slicecraft.com';

    let emailSent = false;
    let previewUrl = null;

    if (lowStockItems.length > 0) {
      const emailResult = await sendLowStockAlertEmail(adminEmail, lowStockItems, threshold);
      emailSent = true;
      previewUrl = emailResult?.previewUrl || null;

      const io = getIO();
      if (io) {
        io.emit('inventory:low_stock_alert', {
          count: lowStockItems.length,
          items: lowStockItems,
          threshold,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: lowStockItems.length > 0
        ? `Alert triggered: ${lowStockItems.length} items below threshold.`
        : 'All inventory items are sufficiently stocked.',
      lowStockItems,
      emailSent,
      adminEmail,
      previewUrl,
      threshold,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error triggering low stock check.',
      error: err.message,
    });
  }
};
