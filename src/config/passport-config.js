import passportJWT from 'passport-jwt';
import config from './env';
import User from 'Models/User.model';
import APIError from 'Utils/APIError';

const ExtractJwt = passportJWT.ExtractJwt;
const jwtStrategy = passportJWT.Strategy;

module.exports = function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET || config.jwtSecret;
  passport.use(
    new jwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        if (user) {
          return done(null, user);
        }
        throw new APIError('You Are Not Authorized.', 401, true);
      } catch (e) {
        console.log('e', e);
        done(e, null);
      }
    }),
  );
};
