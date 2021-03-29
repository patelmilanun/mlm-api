const { PaymentGateway } = require('cashfree-sdk');

const pg = new PaymentGateway({
  env: 'TEST',
  apiVersion: '1.0.0',
  appId: '618495f34f43eb5410a46b52094816',
  secretKey: '93dd9d05ccd6936d74efd7a4144499bf2ef39713',
});

module.exports = { pg };
