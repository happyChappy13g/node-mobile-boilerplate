import express from 'express';
import paramValidation from 'Validations';
import {
  getCurrentUser,
  updateUser,
  updateUserDevice,
} from '../controllers/user.controller';
import {celebrate} from 'celebrate';

const router = express.Router(); // eslint-disable-line new-cap

/** /api/user/ - Updates the current user's information */
router
  .route('/me')
  .get(getCurrentUser)
  .put(updateUser);

router
  .route('/me/device')
  .put(celebrate(paramValidation.device), updateUserDevice);

module.exports = router;
