import { UserModel } from './User.js';
import { InventoryModel } from './Inventory.js';
import { PizzaModel } from './Pizza.js';
import { OrderModel } from './Order.js';
import { getDBStatus } from '../config/db.js';

// In-memory backing collections for zero-setup fallback
class MemoryStore {
  constructor() {
    this.users = [];
    this.inventory = [];
    this.pizzas = [];
    this.orders = [];
  }

  // User methods
  async findUserByEmail(email) {
    if (getDBStatus()) {
      return await UserModel.findOne({ email: email.toLowerCase() });
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (getDBStatus()) {
      return await UserModel.findById(id);
    }
    return this.users.find((u) => u._id === id || u.id === id) || null;
  }

  async findUserByVerificationToken(token) {
    if (getDBStatus()) {
      return await UserModel.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      });
    }
    const now = new Date();
    return (
      this.users.find(
        (u) =>
          u.verificationToken === token &&
          u.verificationTokenExpires &&
          new Date(u.verificationTokenExpires) > now
      ) || null
    );
  }

  async findUserByResetToken(token) {
    if (getDBStatus()) {
      return await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });
    }
    const now = new Date();
    return (
      this.users.find(
        (u) =>
          u.resetPasswordToken === token &&
          u.resetPasswordExpires &&
          new Date(u.resetPasswordExpires) > now
      ) || null
    );
  }

  async createUser(userData) {
    if (getDBStatus()) {
      const user = new UserModel(userData);
      return await user.save();
    }
    const user = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id, updateData) {
    if (getDBStatus()) {
      return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    const index = this.users.findIndex((u) => u._id === id || u.id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updateData,
      updatedAt: new Date(),
    };
    return this.users[index];
  }

  // Inventory methods
  async getAllInventory() {
    if (getDBStatus()) {
      return await InventoryModel.find().sort({ category: 1, name: 1 });
    }
    return [...this.inventory].sort((a, b) => a.category.localeCompare(b.category));
  }

  async getInventoryByCategory(category) {
    if (getDBStatus()) {
      return await InventoryModel.find({ category });
    }
    return this.inventory.filter((i) => i.category === category);
  }

  async findInventoryById(id) {
    if (getDBStatus()) {
      return await InventoryModel.findById(id);
    }
    return this.inventory.find((i) => i._id === id || i.id === id) || null;
  }

  async findInventoryByName(name) {
    if (getDBStatus()) {
      return await InventoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }
    return (
      this.inventory.find((i) => i.name.toLowerCase() === name.toLowerCase()) || null
    );
  }

  async createInventory(item) {
    if (getDBStatus()) {
      const doc = new InventoryModel(item);
      return await doc.save();
    }
    const newItem = {
      _id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...item,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.inventory.push(newItem);
    return newItem;
  }

  async updateInventoryStock(id, newStock, threshold) {
    if (getDBStatus()) {
      const update = { stock: newStock };
      if (threshold !== undefined) update.threshold = threshold;
      return await InventoryModel.findByIdAndUpdate(id, update, { new: true });
    }
    const item = this.inventory.find((i) => i._id === id || i.id === id);
    if (!item) return null;
    item.stock = Math.max(0, newStock);
    if (threshold !== undefined) item.threshold = threshold;
    item.updatedAt = new Date();
    return item;
  }

  async decrementStockForOrder(items) {
    const decrementedSummary = [];
    const lowStockAlerts = [];

    for (const item of items) {
      const qty = item.quantity || 1;
      const { base, sauce, cheese, vegetables = [] } = item.customization || {};

      const ingredientsToDecrement = [
        { name: base, amount: qty },
        { name: sauce, amount: qty },
        { name: cheese, amount: qty },
        ...vegetables.map((v) => ({ name: v, amount: qty })),
      ].filter((x) => Boolean(x.name));

      for (const req of ingredientsToDecrement) {
        if (getDBStatus()) {
          const invItem = await InventoryModel.findOne({
            name: { $regex: new RegExp(`^${req.name}$`, 'i') },
          });
          if (invItem) {
            invItem.stock = Math.max(0, invItem.stock - req.amount);
            await invItem.save();
            decrementedSummary.push({ name: invItem.name, stock: invItem.stock });
            if (invItem.stock < invItem.threshold) {
              lowStockAlerts.push(invItem);
            }
          }
        } else {
          const invItem = this.inventory.find(
            (i) => i.name.toLowerCase() === req.name.toLowerCase()
          );
          if (invItem) {
            invItem.stock = Math.max(0, invItem.stock - req.amount);
            invItem.updatedAt = new Date();
            decrementedSummary.push({ name: invItem.name, stock: invItem.stock });
            if (invItem.stock < invItem.threshold) {
              lowStockAlerts.push(invItem);
            }
          }
        }
      }
    }

    return { decrementedSummary, lowStockAlerts };
  }

  async getLowStockItems(threshold = 20) {
    if (getDBStatus()) {
      return await InventoryModel.find({
        $expr: { $lt: ['$stock', '$threshold'] },
      });
    }
    return this.inventory.filter((i) => i.stock < (i.threshold || threshold));
  }

  // Pizza Preset methods
  async getAllPizzas() {
    if (getDBStatus()) {
      return await PizzaModel.find({ isAvailable: true });
    }
    return [...this.pizzas];
  }

  async createPizza(pizzaData) {
    if (getDBStatus()) {
      const pizza = new PizzaModel(pizzaData);
      return await pizza.save();
    }
    const newPizza = {
      _id: 'pz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...pizzaData,
      createdAt: new Date(),
    };
    this.pizzas.push(newPizza);
    return newPizza;
  }

  // Order methods
  async createOrder(orderData) {
    if (getDBStatus()) {
      const order = new OrderModel(orderData);
      return await order.save();
    }
    const newOrder = {
      _id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async findOrderById(id) {
    if (getDBStatus()) {
      return await OrderModel.findById(id);
    }
    return this.orders.find((o) => o._id === id || o.id === id || o.orderNumber === id) || null;
  }

  async findOrdersByUser(userId) {
    if (getDBStatus()) {
      return await OrderModel.find({ userId }).sort({ createdAt: -1 });
    }
    return this.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getAllOrders() {
    if (getDBStatus()) {
      return await OrderModel.find().sort({ createdAt: -1 });
    }
    return [...this.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateOrderStatus(id, newStatus, note = '') {
    const timelineEntry = {
      status: newStatus,
      timestamp: new Date(),
      note: note || `Status updated to ${newStatus}`,
    };

    if (getDBStatus()) {
      return await OrderModel.findByIdAndUpdate(
        id,
        {
          status: newStatus,
          $push: { timeline: timelineEntry },
        },
        { new: true }
      );
    }

    const order = this.orders.find((o) => o._id === id || o.id === id);
    if (!order) return null;
    order.status = newStatus;
    if (!order.timeline) order.timeline = [];
    order.timeline.push(timelineEntry);
    order.updatedAt = new Date();
    return order;
  }

  async updateOrderPayment(id, paymentInfo) {
    if (getDBStatus()) {
      return await OrderModel.findByIdAndUpdate(id, paymentInfo, { new: true });
    }
    const order = this.orders.find((o) => o._id === id || o.id === id);
    if (!order) return null;
    Object.assign(order, paymentInfo);
    order.updatedAt = new Date();
    return order;
  }
}

export const dbStore = new MemoryStore();
export default dbStore;
