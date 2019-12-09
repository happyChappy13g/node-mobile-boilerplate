import passport from 'passport';
import APIError from './APIError';

export const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', (error, user, info) => {
    if (user) {
      req.user = user;
      req.info = info;
      next();
    } else {
      return next(error || new APIError(info.message, 403, true));
    }
  })(req, res, next);
};

export const isSuperUser = (req, _, next) => {
  if (typeof req.user === 'undefined') {
    return next(new Error('User must be logged in'));
  }
  return req.user.isSuperUser
    ? next()
    : next(new Error('User must be a super admin to access this resource'));
};
