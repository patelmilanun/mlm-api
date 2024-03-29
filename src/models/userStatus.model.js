const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { statusTypes } = require('../config/statuses');

const userStatusSchema = mongoose.Schema(
  {
    statusType: {
      type: String,
      enum: [statusTypes.PAYMENT_PENDING, statusTypes.PAYMENT_COMPLETED, statusTypes.PAYMENT_FAILED],
      required: true,
    },
    description: {
      type: String,
      private: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userStatusSchema.plugin(toJSON);
userStatusSchema.plugin(paginate);

/**
 * @typedef UserStatus
 */
const UserStatus = mongoose.model('UserStatus', userStatusSchema);

module.exports = UserStatus;
