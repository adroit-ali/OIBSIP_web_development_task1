import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, enum: ['Veg', 'Non-Veg', 'Gourmet'], default: 'Veg' },
    basePrice: { type: Number, required: true },
    image: { type: String, default: '' },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    prepTime: { type: String, default: '20-25 mins' },
    ingredients: {
      base: { type: String, default: 'Hand Tossed' },
      sauce: { type: String, default: 'Classic Marinara' },
      cheese: { type: String, default: 'Mozzarella' },
      vegetables: [{ type: String }],
    },
    badge: { type: String, default: '' },
    isPopular: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PizzaModel = mongoose.models.Pizza || mongoose.model('Pizza', pizzaSchema);
export default PizzaModel;
