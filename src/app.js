import APIError from 'Utils/APIError';
import config from './config/env';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import passConfig from './config/passport-config';
import passport from 'passport';
import routes from './routes';
import Celebrate from 'celebrate';
require('dotenv').config();

const MONGO_URL =
  config.env === 'development'
    ? process.env.LOCAL_MONGO_URL
    : process.env.MONGO_URL;
const APP_PORT = process.env.PORT || 3000;
const app = express();

const connection = mongoose.connect(MONGO_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
});
mongoose.set('debug', config.env === 'development');

app.use(cors());
// parse body params and attache them to req.body
app.use(express.json());
app.use(express.urlencoded({limit: '50mb', extended: true}));

// configure passport for authentication
passConfig(passport);
app.use(passport.initialize());

// mount all routes on /api path
app.use('/api', routes);

// handle validation errors using celebrate middleware
app.use(Celebrate.errors());
// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  console.log('not instance: err: ', err);
  if (!(err instanceof APIError)) {
    console.log('not***************');
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});
// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log('40444444444444444444444');
  return next(new APIError('API not found', 404, true));
});
// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  console.log('err', err);
  return res.status(err.status).json({
    message: err.isPublic ? err.message : err.status,
    stack: config.env === 'development' ? err.stack.split('\n') : {},
  });
});

app.listen(APP_PORT, () => {
  console.log(`App is now running on and listening to port: ${APP_PORT}`);
});

export default app;
