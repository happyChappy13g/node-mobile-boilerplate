import mongoose from 'mongoose';

export const ImageSizes = Object.freeze({
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XLG: 'xlg',
  ORIGINAL: 'original',
});
const urls = Object.values(ImageSizes).map(size => ({
  s3Key: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: Object.values(ImageSizes),
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}));

const ImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  urls,
});

export default mongoose.model('Image', ImageSchema);
