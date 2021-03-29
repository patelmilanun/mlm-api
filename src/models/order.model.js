const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const orderSchema = mongoose.Schema(
  {
    orderAmount: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: String,
    },
    orderNote: {
      type: String,
    },
    txStatus: {
      type: String,
    },
    paymentMode: {
      type: String,
    },
    txMsg: {
      type: String,
    },
    txTime: {
      type: String,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
