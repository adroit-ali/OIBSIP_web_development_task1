import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
    },
    stock: { type: Number, required: true, default: 50 },
    threshold: { type: Number, required: true, default: 20 },
    unit: { type: String, default: 'units' },
    price: { type: Number, default: 0 },
    description: { type: String, default: '' },
    color: { type: String, default: '#fbbf24' },
    icon: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const InventoryModel = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export default InventoryModel;
