import config from '../config/env';
import APIError from 'Utils/APIError';
import Device, {DeviceTypes} from 'Models/Device.model';
import Image, {ImageSizes} from 'Models/Image.model';
import User from 'Models/User.model';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

async function updateUser(req, res, next) {
  try {
    const {age, bio, email, name} = req.body;

    const user = req.user;
    user.age = age;
    user.bio = bio;
    user.email = email;
    user.name = name;
    user.hasCompletedRegistration = true;
    await user.save();
    const updatedUser = await User.findOne({_id: user._id}).populate({
      path: 'pictures',
      options: {sort: {order: 1}},
    });
    res.json({
      success: true,
      message: 'Successfully updated user information',
      user: updatedUser.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function updateUserDevice(req, res, next) {
  try {
    const {deviceType, pushToken} = req.body;
    const device = await new Device({
      deviceType,
      pushToken,
    }).save();
    req.user.device = device._id;
    await req.user.save();
    res.json({
      success: true,
      message: 'Successfully updated the device',
      device: device.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

// Note: This might not be used yet for Worldpark project
async function getNearbyUsers(req, res, next) {
  try {
    const {lat, lng} = req.params;
    const near = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };
    const users = await User.getNearbyUsers(near, {
      _id: {$ne: req.user._id},
    });
    res.json({
      success: true,
      message: 'Successfully got users',
      users: users,
    });
  } catch (e) {
    next(e);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await _getUserById(req.user._id);
    res.json({
      success: true,
      message: 'Successfully got current user',
      user: user.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function updateUserLocation(req, res, next) {
  try {
    const {
      body: {latitude, longitude},
      user: {_id},
    } = req;

    const user = await User.findOneAndUpdate(
      {_id},
      {
        ...user,
        location: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      },
      {new: true},
    ).populate('pictures');
    res.json({
      success: true,
      message: "Successfully updated user's location",
      user: user.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function _getUserById(id) {
  try {
    return await User.findOne({_id: id}).populate({
      path: 'pictures',
      options: {sort: {order: 1}},
    });
  } catch (e) {
    throw new APIError(`There was an error getUserById ${id}`, 500, false);
  }
}

async function _updateUserById(id, updateObject) {
  try {
    return await User.findOneAndUpdate({_id: id}, updateObject, {
      new: true,
    });
  } catch (e) {
    throw new APIError(`There was an error updateUserById ${id}`, 500, false);
  }
}

async function _getImageFromRequest(req, next) {
  try {
    const {originalname: name} = req.file;
    const {order} = req.body;
    const urls = Object.values(ImageSizes).map(size => ({
      s3Key: req.file[size].Key,
      size,
      url: req.file[size].Location,
    }));
    return await new Image({
      name,
      order,
      urls,
    }).save();
  } catch (e) {
    next(e);
  }
}

async function updateUserPicture(req, res, next) {
  try {
    const {order, pictureID} = req.body;
    // There can only be 5 pictures per user
    if (order > 5 || req.user.pictures.length >= 5) {
      throw new APIError('You cannot upload more than 5 images', 400, false);
    }
    const picture = await _getImageFromRequest(req, next);
    // remove existing picture from the database and replace it with the new one
    const existingPicture = await Image.findOne({_id: pictureID, order});
    let user = await User.findOne({
      _id: req.user._id,
      pictures: {$in: [pictureID]},
    });
    const userHasPicture = user != null && user.length > 0;

    if (existingPicture !== undefined && userHasPicture) {
      // remove the image if already in system
      user = await User.findOneAndUpdate(
        {_id: req.user._id, pictures: existingPicture._id},
        {
          $set: {
            'pictures.$': picture._id,
          },
        },
        {new: true},
      ).populate('pictures');
      await existingPicture.remove();
      // // Remove image from S3
      // const images = await Image.find({
      //   s3Key: `^${new RegExp(image.s3Key.split('.')[0])}`,
      // });
      // await Promise.all(
      //   images.map(async image => await deleteObject(image.s3Key)),
      // );
    } else {
      user = await User.findOneAndUpdate(
        {_id: req.user._id},
        {
          $addToSet: {
            pictures: picture._id,
          },
        },
        {new: true},
      ).populate('pictures');
    }
    res.json({
      success: true,
      message: 'Successfully uploaded picture',
      picture: picture.toJSON(),
      user: user.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function deleteUserPicture(req, res, next) {
  try {
    const {pictureID} = req.params;
    await Image.deleteOne({_id: pictureID});
    const user = await User.findOneAndUpdate(
      {_id: req.user._id},
      {$pull: {pictures: pictureID}},
      {new: true},
    ).populate('pictures');
    res.json({
      success: true,
      message: 'Successfully deleted picture',
      user: user.toJSON(),
    });
  } catch (e) {
    next(e);
  }
}

async function updateUserPictureOrder(req, res, next) {
  try {
    const updateOrderAsync = async ({id, order}) =>
      await Image.findOneAndUpdate({_id: id}, {order}, {new: true});
    const pictures = await Promise.all(
      req.body.pictures.map(picture => updateOrderAsync(picture)),
    );
    res.json({
      success: true,
      message: 'Successfully update pictures order',
      pictures: pictures.map(picture => picture.toJSON()),
    });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  deleteUserPicture,
  getCurrentUser,
  getNearbyUsers,
  updateUser,
  updateUserDevice,
  updateUserLocation,
  updateUserPicture,
  updateUserPictureOrder,
};
