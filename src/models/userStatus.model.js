const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { statusTypes } = require('../config/statuses');

const userStatusSchema = mongoose.Schema(
  {
    statusType: {
      type: String,
      enum: [statusTypes.PAYMENT_PENDING],
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

/**
 * @typedef UserStatus
 */
const UserStatus = mongoose.model('UserStatus', userStatusSchema);

module.exports = UserStatus;
