const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { generatePaymentLink } = require('../utils/payment');
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
  const tokens = await tokenService.generateAuthTokens(user);
  user.status = userStatus;
  res.status(httpStatus.CREATED).send({ user, tokens, paymentLink: await generatePaymentLink(user, order) });
});

const registerPaymentStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  res.status(httpStatus.CREATED).send({ paymentStatus: user.status.statusType });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
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
  registerPaymentStatus,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
};
