const { PaymentGateway } = require('cashfree-sdk');

const pg = new PaymentGateway({
  env: 'TEST',
  apiVersion: '1.0.0',
  appId: process.env.CASHFREE_API_KEY,
  secretKey: process.env.CASHFREE_SECRET_KEY,
});

module.exports = { pg };
