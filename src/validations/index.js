import {Joi} from 'celebrate';
import {DeviceTypes} from 'Models/Device.model';

export default {
  // POST /api/auth/login
  loginUser: {
    body: {
      email: Joi.string()
        .email({minDomainAtoms: 2})
        .required(),
      password: Joi.string().required(),
    },
  },
  signupUser: {
    body: {
      email: Joi.string()
        .email({minDomainAtoms: 2})
        .required(),
      password: Joi.string().required(),
      passwordConfirm: Joi.any()
        .valid(Joi.ref('password'))
        .options({
          language: {
            any: {
              allowOnly: "passwords don't match",
            },
          },
        })
        .required(),
    },
  },
  facebookUser: {
    body: {
      avatar: Joi.string().required(),
      deviceType: Joi.string().required(),
      email: Joi.string()
        .email({minDomainAtoms: 2})
        .required(),
      facebookID: Joi.string().required(),
      firstName: Joi.string(),
      lastName: Joi.string(),
    },
  },
  device: {
    body: {
      deviceType: Joi.string()
        .valid(Object.values(DeviceTypes))
        .required(),
      pushToken: Joi.string(),
    },
  },

  getPhoneNumber:{
    body:{
      phoneNumber: Joi.string(),
    }
  },
  verifyPhoneNumber:{
    body:{
      phoneNumber: Joi.string(),
      verificationCode: Joi.string(),
    }
  },
};
