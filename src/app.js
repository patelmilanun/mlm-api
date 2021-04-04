const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { userService, statusService } = require('./services');
const logger = require('./config/logger');
const { statusTypes } = require('./config/statuses');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

mongoose.connection.once('open', async () => {
  if (process.env.NODE_ENV !== 'test') {
    // create default super admin user if not exist
    logger.info('Creating super admin user if not exsist');
    let status = await statusService.getStatusByType(statusTypes.PAYMENT_PENDING);
    if (!status) {
      status = await statusService.createStatus({
        statusType: statusTypes.PAYMENT_PENDING,
        description: 'When user payment is pending after signup',
      });
    }
    const user = await userService.getUserByEmail('admin@inspireonics.com');
    if (!user) {
      // create the user
      const createdUser = await userService.createUser({
        name: 'admin',
        email: 'admin@inspireonics.com',
        password: 'Inspireonics123@',
        role: 'admin',
        phoneNumber: '9981726547',
        profileImageHash: 'admin',
        status: status.id,
      });
      Object.assign(createdUser, {
        referedBy: createdUser.id,
      });
      await createdUser.save();
    }
  }
});

module.exports = app;
