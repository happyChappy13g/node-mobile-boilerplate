import {
  getPhoneNumber,
  signup,
  login,
  verifyPhoneNumber,
} from 'Controllers/auth.controller';
import express from 'express';
import {isAuthenticated, isSuperUser} from 'Utils/auth';
import {celebrate} from 'celebrate';
import paramValidation from 'Validations';

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login').post(celebrate(paramValidation.loginUser), login);

/** POST /api/auth/phonenumber - gets a phone number and saves in database with a verification code */
router
  .route('/phonenumber')
  .post(celebrate(paramValidation.getPhoneNumber), getPhoneNumber);

router
  .route('/verify-phonenumber')
  .post(celebrate(paramValidation.verifyPhoneNumber), verifyPhoneNumber);

/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/signup').post(celebrate(paramValidation.signupUser), signup);

/** Get /api/auth/logout */
// router.route('/logout').get(logout);

module.exports = router;
