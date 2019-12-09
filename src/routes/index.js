import app from '../app';
import authRoutes from './auth';
import express from 'express';
import listEndpoints from 'express-list-endpoints';
import userRoutes from './user';
import {isAuthenticated} from 'Utils/auth';

const router = express.Router();

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

// show a list of routes to developers
router.get('/list', (req, res) => {
  const endpoints = [];
  listEndpoints(app).forEach(endpoint => {
    endpoint.methods.forEach(method => {
      endpoints.push({path: endpoint.path, method});
    });
  });

  res.send({endpoints});
});

// mount auth route at /auth
router.use('/auth', authRoutes);

// protect all other routes from this point on
router.use(isAuthenticated);

// mount auth route at /user
router.use('/users', userRoutes);

module.exports = router;
