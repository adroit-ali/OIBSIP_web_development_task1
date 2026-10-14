import dbStore from '../models/store.js';

export const getAllPizzas = async (req, res) => {
  try {
    const pizzas = await dbStore.getAllPizzas();
    return res.status(200).json({
      success: true,
      data: pizzas,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pizza varieties.',
      error: err.message,
    });
  }
};
