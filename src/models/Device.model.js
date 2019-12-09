import mongoose from 'mongoose';

export const DeviceTypes = Object.freeze({
  IOS: 'ios',
  ANDROID: 'android',
});

const DeviceSchema = new mongoose.Schema({
  deviceType: {
    type: String,
    enum: Object.values(DeviceTypes),
    required: false,
  },
  pushToken: {
    type: String,
    required: false,
  },
});

Object.assign(DeviceSchema.statics, {
  DeviceTypes,
});

export default mongoose.model('Device', DeviceSchema);
