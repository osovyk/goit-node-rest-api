import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

const secret = process.env.JWT_SECRET || 'secret_key';

const params = {
    secretOrKey: secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    passReqToCallback: true,
};

passport.use(
    'jwt',
    new JwtStrategy(params, async (req, payload, done) => {
        try {
            const user = await User.findByPk(payload.id);
            if (!user) {
                return done(new Error('User not found'));
            }

            const authHeader = req.headers.authorization;
            const token = authHeader ? authHeader.replace('Bearer ', '') : null;

            if (!user.token || user.token !== token) {
                return done(new Error('Token has been invalidated'));
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

export default passport;
