const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { pg } = require('../config/cashfree');
// vugyroji@digital10network.com

const generatePaymentLink = async (userDetails, orderDetails) => {
  const paymentLink = await pg.orders.createOrders({
    orderId: orderDetails.id, // required
    orderAmount: orderDetails.orderAmount, // required
    customerName: userDetails.name, // required
    customerPhone: userDetails.phoneNumber, // required
    customerEmail: userDetails.email, // required
    returnUrl: 'https://example.com/return', // required
    notifyUrl: 'https://example.com/notify',
  });
  if (paymentLink.status === 'ERROR') {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate payment link');
  }

  return paymentLink.paymentLink;
};

module.exports = { generatePaymentLink };
