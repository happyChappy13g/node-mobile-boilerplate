const config = require('../config/env');
import jwt from 'jsonwebtoken';
import APIError, {alreadyExists, isFound, isBadRequest} from 'Utils/APIError';
import User from 'Models/User.model';
import {generateVerificationCode} from 'Utils';
import {parsePhoneNumberFromString} from 'libphonenumber-js';
const twilio = require('twilio')(config.twilioSid, config.twilioAuthToken);

const _generateJWT = ({_id, name, email}) =>
  jwt.sign({id: _id, name, email}, process.env.JWT_SECRET || config.jwtSecret);

export const login = async (req, res, next) => {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email}, '+password');
    isFound(user, 'User');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new APIError('Incorrect password', 403, false);
    }

    res.json({
      success: true,
      message: 'user successfully logged in',
      jwtAccessToken: `Bearer ${_generateJWT(user)}`,
      user,
    });
  } catch (e) {
    console.log('e', e);
    next(e);
  }
};

export const verifyPhoneNumber = async (req, res, next) => {
  const {phoneNumber, verificationCode} = req.body;
  const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber);
  try {
    const user = await User.findOne({
      phoneNumber: parsedPhoneNumber.formatInternational(),
      smsVerificationCode: verificationCode,
      isVerified: false,
    });
    // if such phone number doesn't exist or verification code is wrong
    // or the user is verfied already. we throw this error.
    if (!user) {
      throw new APIError('Verification Code Is Not Correct.', 400, true);
    }
    user.isVerified = true;
    await user.save();
    res.send({
      success: true,
      message: 'Successfully Verified The User.',
    });
  } catch (e) {
    console.log('e', e);
    next(e);
  }
};

export const getPhoneNumber = async (req, res, next) => {
  try {
    const phoneNumber = parsePhoneNumberFromString(req.body.phoneNumber);
    isBadRequest(
      !phoneNumber.isValid() &&
        `${phoneNumber.number} is not a vlid phone number.`,
    );
    const internationalPhoneNumberFormat = phoneNumber.formatInternational();
    const existingNumber = await User.findOne({
      phoneNumber: internationalPhoneNumberFormat,
    });
    alreadyExists(existingNumber, 'Phone Number');
    const user = await new User({
      phoneNumber: internationalPhoneNumberFormat,
      smsVerificationCode: generateVerificationCode(),
      smsVerificationCreationTime: new Date(),
    }).save();
    await twilio.messages.create({
      body: `Your verfication code in mirari is ${user.smsVerificationCode}`,
      from: '+17743003127',
      to: internationalPhoneNumberFormat,
    });

    res.send({
      success: true,
      message: 'sent the verificaiton code successfully',
    });
  } catch (e) {
    console.log('e', e);
    next(e);
  }
};

export const signup = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const existingUser = await User.findOne({email: email.toLowerCase()});
    // User already exist
    alreadyExists(existingUser, 'User');
    const user = await new User({email, password}).save();
    res.send({
      success: true,
      message: 'Successfully created new user',
      user,
      jwtAccessToken: `Bearer ${genJWT(user)}`,
    });
  } catch (err) {
    next(err);
  }
};

function logout(req, res, next) {
  // TODO: expire the current token
  const returnObj = {
    success: true,
    message: 'user logout successfully',
  };
  res.json(returnObj);
}
