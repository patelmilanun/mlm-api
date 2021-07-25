const httpStatus = require('http-status');
const crypto = require('crypto');
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generatePaymentLink, getGeneratedPaymentLink } = require('../utils/payment');
const { statusTypes } = require('../config/statuses');
const { authService, userService, tokenService, emailService, statusService, orderService } = require('../services');

const register = catchAsync(async (req, res) => {
  const { name, referedBy } = req.body;
  const userStatus = await statusService.getStatusByType(statusTypes.PAYMENT_PENDING);
  if (!userStatus) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Status not found');
  }
  let refered;
  if (referedBy === '') {
    const user = await userService.getUserByEmail('admin@inspireonics.com');
    refered = user.id;
  } else {
    const user = await userService.getUserById(referedBy);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'The refereal id not found');
  }
  const user = await userService.createUser({
    ...req.body,
    profileImageHash: name,
    status: userStatus.id,
    referedBy: refered,
  });
  const order = await orderService.createOrder({ orderAmount: 100, createdBy: user.id });
  // const tokens = await tokenService.generateAuthTokens(user);
  user.status = userStatus;
  res.status(httpStatus.CREATED).send({ user, paymentLink: await generatePaymentLink(user, order) });
});

const getRegisterPaymentStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  res.send({ paymentStatus: user.status.statusType });
});

const getPaymentLink = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const orders = await orderService.findOrders({ createdBy: userId, txStatus: null }, { limit: 1 });
  let paymentLink;
  if (orders.length > 0 && moment().diff(moment(orders[0].createdAt), 'days') < 30) {
    paymentLink = getGeneratedPaymentLink(orders[0]);
  } else {
    const user = await userService.getUserById(userId);
    const order = await orderService.createOrder({ orderAmount: 100, createdBy: user.id });
    paymentLink = await generatePaymentLink(user, order);
  }
  const statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_PENDING);
  await userService.updateUserById(userId, { status: statusCompleted });
  res.send({ paymentLink });
});

const redirectRegisterPaymentStatus = catchAsync(async (req, res) => {
  const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = req.body;

  const signatureData = [orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime].join('');

  const computedsignature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
    .update(signatureData)
    .digest('base64');

  if (computedsignature === signature) {
    const tx = await orderService.updateOrderById(orderId, {
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
    });
    let statusCompleted;
    if (txStatus === 'SUCCESS') {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_COMPLETED);
    } else if (txStatus === 'FLAGGED' || txStatus === 'PENDING') {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_PENDING);
    } else {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_FAILED);
    }
    await userService.updateUserById(
      tx.createdBy._id,
      txStatus === 'SUCCESS' ? { status: statusCompleted, role: 'user' } : { status: statusCompleted }
    );
  }
  res.redirect(`${process.env.CLIENT_URL}/auth/register-payment-status`);
});

const updateRegisterPaymentStatus = catchAsync(async (req, res) => {
  const { orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime, signature } = req.body;

  const signatureData = [orderId, orderAmount, referenceId, txStatus, paymentMode, txMsg, txTime].join('');

  const computedsignature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
    .update(signatureData)
    .digest('base64');

  if (computedsignature === signature) {
    const tx = await orderService.updateOrderById(orderId, {
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
    });
    let statusCompleted;
    if (txStatus === 'SUCCESS') {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_COMPLETED);
    } else if (txStatus === 'FLAGGED' || txStatus === 'PENDING') {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_PENDING);
    } else {
      statusCompleted = await statusService.getStatusByType(statusTypes.PAYMENT_FAILED);
    }
    await userService.updateUserById(
      tx.createdBy._id,
      txStatus === 'SUCCESS' ? { status: statusCompleted, role: 'user' } : { status: statusCompleted }
    );
  }

  res.send();
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  let tokens = {};
  let paymentLink = '';
  if (user.role === 'guest') {
    const orders = await orderService.findOrders({ createdBy: user.id, txStatus: null }, { limit: 1 });
    if (orders.length > 0 && moment().diff(moment(orders[0].createdAt), 'days') < 30) {
      paymentLink = await getGeneratedPaymentLink(orders[0]);
    } else {
      const order = await orderService.createOrder({ orderAmount: 100, createdBy: user.id });
      paymentLink = await generatePaymentLink(user, order);
    }
  } else {
    tokens = await tokenService.generateAuthTokens(user);
  }
  res.send({ user, tokens, paymentLink });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  getRegisterPaymentStatus,
  getPaymentLink,
  redirectRegisterPaymentStatus,
  updateRegisterPaymentStatus,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
