import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {InternalError} from 'Utils/APIError';

const {Schema} = mongoose;

const UserSchema = new Schema(
  {
    isVerified: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    smsVerificationCode: {
      type: String,
    },
    smsVerificationCreationTime: {
      type: Date,
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'Image',
      autopopulate: true,
    },
    bio: {
      type: String,
      required: false,
      default: '',
    },
    device: {
      type: Schema.Types.ObjectId,
      ref: 'Device',
      autopopulate: true,
    },
    email: {
      type: String,
      default: '',
    },
    facebookID: {
      type: String,
      default: '',
    },
    firstName: {
      type: String,
      default: '',
    },
    lastName: {
      type: String,
      required: false,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      select: false,
    },
    images: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Image',
        },
      ],
      validate: [val => val.length <= 5, 'images exceeds the limit of 5'],
    },
  },
  {timestamps: true},
);

UserSchema.plugin(require('mongoose-autopopulate'));

UserSchema.pre('save', async function(next) {
  try {
    const user = this;
    if (this.isModified('password') || this.isNew) {
      // This if statement is necessary as some user might register using Facebook
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
      } else {
        next();
      }
    } else {
      return next();
    }
  } catch (err) {
    next(err);
  }
});

/**
 * compare the stored hashed value of the password with the given value of the password
 * @param pw - password whose value has to be compare
 * @param cb - callback function
 * @Note We should not use arrow functions because we lose access to `this`
 */
UserSchema.methods.comparePassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new InternalError(err);
  }
};

export default mongoose.model('User', UserSchema);
