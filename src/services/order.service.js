const httpStatus = require('http-status');
const { OrderStatus } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a order
 * @param {Object} orderBody
 * @returns {Promise<Order>}
 */
const createOrder = async (orderBody) => {
  const order = await OrderStatus.create(orderBody);
  return order;
};

/**
 * Query for orders
 * @param {Object} filter - Mongo filter`
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryOrders = async (filter, options) => {
  const orders = await OrderStatus.paginate(filter, options);
  return orders;
};

/**
 * Query for orders
 * @param {Object} filter - Mongo filter`
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: [-(for desc)]sortField
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @returns {Promise<QueryResult>}
 */
const findOrders = async (filter, options) => {
  const orders = await OrderStatus.find(filter)
    .limit(options.limit ? options.limit : 10)
    .sort(options.sortBy ? options.sortBy : '-createdAt');
  return orders;
};

/**
 * Get order by id
 * @param {ObjectId} id
 * @returns {Promise<Order>}
 */
const getOrderById = async (id) => {
  return OrderStatus.findById(id);
};

/**
 * Update order by id
 * @param {ObjectId} orderId
 * @param {Object} updateBody
 * @returns {Promise<Order>}
 */
const updateOrderById = async (orderId, updateBody) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  Object.assign(order, updateBody);
  await order.save();
  return order;
};

/**
 * Delete order by id
 * @param {ObjectId} orderId
 * @returns {Promise<Order>}
 */
const deleteOrderById = async (orderId) => {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  await order.remove();
  return order;
};

module.exports = {
  createOrder,
  queryOrders,
  findOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
