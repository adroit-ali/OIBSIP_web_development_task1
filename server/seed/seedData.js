import bcrypt from 'bcryptjs';
import dbStore from '../models/store.js';

export const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@slicecraft.com';
    const existingAdmin = await dbStore.findUserByEmail(adminEmail);
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', salt);
      await dbStore.createUser({
        name: 'Chief Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      });
      console.log(`👑 Seeded Admin: ${adminEmail} / Admin@12345`);
    }

    // 2. Seed Demo User
    const demoUserEmail = 'customer@slicecraft.com';
    const existingCustomer = await dbStore.findUserByEmail(demoUserEmail);
    if (!existingCustomer) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('User@12345', salt);
      await dbStore.createUser({
        name: 'John Doe',
        email: demoUserEmail,
        password: hashedPassword,
        role: 'user',
        isVerified: true,
      });
      console.log(`👤 Seeded Demo Customer: ${demoUserEmail} / User@12345`);
    }

    // 3. Seed Inventory (Bases, Sauces, Cheeses, Veggies)
    const existingInventory = await dbStore.getAllInventory();
    if (existingInventory.length === 0) {
      const inventoryItems = [
        // 5 Pizza Bases (Required)
        { name: 'Thin Crust', category: 'base', stock: 45, threshold: 20, unit: 'crusts', price: 9.99, description: 'Crispy ultra-thin dough hand-rolled to golden perfection', color: '#eab308' },
        { name: 'Cheese Burst', category: 'base', stock: 35, threshold: 20, unit: 'crusts', price: 12.99, description: 'Secret molten cheese core that bursts in every bite', color: '#f59e0b' },
        { name: 'Hand Tossed', category: 'base', stock: 50, threshold: 20, unit: 'crusts', price: 10.99, description: 'Traditional Neapolitan airy crust with leopard spotting', color: '#d97706' },
        { name: 'Gluten-Free Cauliflower', category: 'base', stock: 24, threshold: 20, unit: 'crusts', price: 13.99, description: 'Guilt-free artisanal keto-friendly cauliflower crust', color: '#ca8a04' },
        { name: 'Deep Pan Crust', category: 'base', stock: 32, threshold: 20, unit: 'crusts', price: 11.99, description: 'Chicago-style thick buttery crust baked in seasoned pans', color: '#b45309' },

        // 5 Sauces (Required)
        { name: 'Classic Marinara', category: 'sauce', stock: 65, threshold: 20, unit: 'ladles', price: 1.50, description: 'Authentic San Marzano tomatoes infused with wild oregano', color: '#dc2626' },
        { name: 'Creamy Garlic Alfredo', category: 'sauce', stock: 42, threshold: 20, unit: 'ladles', price: 2.20, description: 'Velvety roasted garlic and aged parmesan cream sauce', color: '#fef08a' },
        { name: 'Spicy Peri Peri', category: 'sauce', stock: 38, threshold: 20, unit: 'ladles', price: 1.90, description: 'Fiery bird’s eye chili sauce with smoked paprika kick', color: '#ea580c' },
        { name: 'Pesto Genovese', category: 'sauce', stock: 28, threshold: 20, unit: 'ladles', price: 2.50, description: 'Fresh sweet basil, crushed pine nuts, and virgin olive oil', color: '#16a34a' },
        { name: 'Smokey BBQ', category: 'sauce', stock: 35, threshold: 20, unit: 'ladles', price: 1.80, description: 'Slow-simmered hickory smoked sweet and tangy barbecue glaze', color: '#78350f' },

        // Cheese Options
        { name: 'Mozzarella', category: 'cheese', stock: 75, threshold: 25, unit: 'cups', price: 2.50, description: '100% fresh buffalo mozzarella with glorious stretch', color: '#fef9c3' },
        { name: 'Sharp Cheddar', category: 'cheese', stock: 40, threshold: 20, unit: 'cups', price: 2.80, description: '18-month cave-aged sharp English cheddar', color: '#fde047' },
        { name: 'Ricotta & Feta', category: 'cheese', stock: 30, threshold: 18, unit: 'cups', price: 3.20, description: 'Whipped cloud-like ricotta with tangy Greek feta crumbles', color: '#f8fafc' },
        { name: 'Vegan Almond Cheese', category: 'cheese', stock: 22, threshold: 15, unit: 'cups', price: 3.50, description: 'Plant-based meltable cashew & almond artisan cheese', color: '#fef3c7' },
        { name: 'Aged Parmesan Shavings', category: 'cheese', stock: 45, threshold: 20, unit: 'cups', price: 3.00, description: 'Nutty crystals of 24-month Parmigiano Reggiano', color: '#fef08a' },

        // Vegetables (Multiple Selectable)
        { name: 'Black Olives', category: 'vegetable', stock: 55, threshold: 20, unit: 'portions', price: 1.20, description: 'Kalamata cured pitted black olive rings', color: '#1e293b' },
        { name: 'Bell Peppers', category: 'vegetable', stock: 60, threshold: 20, unit: 'portions', price: 1.10, description: 'Crisp tri-color sweet bell peppers', color: '#22c55e' },
        { name: 'Portobello Mushrooms', category: 'vegetable', stock: 46, threshold: 20, unit: 'portions', price: 1.50, description: 'Earthy pan-seared woodland mushrooms', color: '#a8a29e' },
        { name: 'Pickled Jalapeños', category: 'vegetable', stock: 48, threshold: 20, unit: 'portions', price: 1.20, description: 'Zesty spiced Mexican pepper slices', color: '#84cc16' },
        { name: 'Red Onions', category: 'vegetable', stock: 58, threshold: 20, unit: 'portions', price: 0.90, description: 'Crispy caramelized red onion slivers', color: '#c084fc' },
        { name: 'Sweet Corn', category: 'vegetable', stock: 52, threshold: 20, unit: 'portions', price: 1.00, description: 'Tender golden kernels bursting with sweetness', color: '#facc15' },
        { name: 'Baby Spinach', category: 'vegetable', stock: 34, threshold: 18, unit: 'portions', price: 1.30, description: 'Tender farm-fresh organic baby spinach leaves', color: '#15803d' },
        { name: 'Sun-dried Tomatoes', category: 'vegetable', stock: 30, threshold: 18, unit: 'portions', price: 1.80, description: 'Sun-ripened tomatoes preserved with Italian herbs', color: '#b91c1c' },
      ];

      for (const item of inventoryItems) {
        await dbStore.createInventory(item);
      }
      console.log(`📦 Seeded ${inventoryItems.length} inventory ingredients`);
    }

    // 4. Seed Available Pizza Varieties
    const existingPizzas = await dbStore.getAllPizzas();
    if (existingPizzas.length === 0) {
      const pizzaCatalog = [
        {
          name: 'Margherita Rustica',
          tagline: 'Timeless Italian Masterpiece',
          description: 'Crushed San Marzano marinara, fresh buffalo mozzarella, virgin olive oil, and sweet basil leaves.',
          category: 'Veg',
          basePrice: 14.99,
          rating: 4.9,
          reviewsCount: 342,
          prepTime: '15-20 mins',
          badge: 'Best Seller',
          isPopular: true,
          ingredients: {
            base: 'Hand Tossed',
            sauce: 'Classic Marinara',
            cheese: 'Mozzarella',
            veggies: ['Sun-dried Tomatoes', 'Baby Spinach'],
          },
        },
        {
          name: 'Truffle & Wild Mushroom',
          tagline: 'Gourmet Earthy Indulgence',
          description: 'Garlic Alfredo cream base, portobello mushrooms, aged parmesan shavings, and black truffle drizzle.',
          category: 'Gourmet',
          basePrice: 18.99,
          rating: 4.95,
          reviewsCount: 189,
          prepTime: '20-25 mins',
          badge: 'Chef Choice',
          isPopular: true,
          ingredients: {
            base: 'Thin Crust',
            sauce: 'Creamy Garlic Alfredo',
            cheese: 'Aged Parmesan Shavings',
            veggies: ['Portobello Mushrooms', 'Red Onions'],
          },
        },
        {
          name: 'Fiery Peri Peri Inferno',
          tagline: 'Bold, Spicy & Smoky',
          description: 'Spicy peri peri sauce with melted cheddar & mozzarella, jalapeños, bell peppers, and sweet corn.',
          category: 'Veg',
          basePrice: 16.49,
          rating: 4.8,
          reviewsCount: 220,
          prepTime: '18-22 mins',
          badge: 'Extra Hot 🔥',
          isPopular: true,
          ingredients: {
            base: 'Hand Tossed',
            sauce: 'Spicy Peri Peri',
            cheese: 'Sharp Cheddar',
            veggies: ['Pickled Jalapeños', 'Bell Peppers', 'Sweet Corn'],
          },
        },
        {
          name: 'Quattro Formaggi (Four Cheese)',
          tagline: 'Ultimate Molten Cheese Dream',
          description: 'Cheese burst base smothered in buffalo mozzarella, sharp cheddar, ricotta, and aged parmesan.',
          category: 'Gourmet',
          basePrice: 19.99,
          rating: 4.88,
          reviewsCount: 410,
          prepTime: '20-25 mins',
          badge: 'Ultra Cheesy',
          isPopular: true,
          ingredients: {
            base: 'Cheese Burst',
            sauce: 'Classic Marinara',
            cheese: 'Mozzarella',
            veggies: ['Sun-dried Tomatoes', 'Black Olives'],
          },
        },
        {
          name: 'Mediterranean Garden Harvest',
          tagline: 'Fresh, Crisp & Vibrant',
          description: 'Pesto Genovese base crowned with Kalamata olives, bell peppers, baby spinach, and Greek feta crumbles.',
          category: 'Veg',
          basePrice: 17.50,
          rating: 4.85,
          reviewsCount: 165,
          prepTime: '15-20 mins',
          badge: 'Farm Fresh',
          isPopular: false,
          ingredients: {
            base: 'Gluten-Free Cauliflower',
            sauce: 'Pesto Genovese',
            cheese: 'Ricotta & Feta',
            veggies: ['Black Olives', 'Bell Peppers', 'Baby Spinach'],
          },
        },
        {
          name: 'Smokey Hickory BBQ Delight',
          tagline: 'Sweet, Tangy & Deep Crust',
          description: 'Deep pan crust with smokey BBQ sauce, caramelized red onions, sweet corn, and mozzarella.',
          category: 'Gourmet',
          basePrice: 16.99,
          rating: 4.79,
          reviewsCount: 198,
          prepTime: '20-25 mins',
          badge: 'Customer Fav',
          isPopular: false,
          ingredients: {
            base: 'Deep Pan Crust',
            sauce: 'Smokey BBQ',
            cheese: 'Mozzarella',
            veggies: ['Red Onions', 'Sweet Corn', 'Bell Peppers'],
          },
        },
      ];

      for (const p of pizzaCatalog) {
        await dbStore.createPizza(p);
      }
      console.log(`🍕 Seeded ${pizzaCatalog.length} signature pizzas`);
    }
  } catch (err) {
    console.error('Error during seeding:', err);
  }
};
