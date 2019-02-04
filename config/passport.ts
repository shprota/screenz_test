import passport from 'passport';
import {Strategy as LocalStrategy} from "passport-local";
import {Strategy as BearerStrategy} from "passport-http-bearer";
import {verify} from "jsonwebtoken";
import {User} from "../models/user";
import {IUser, IUserDocument} from "../interfaces/user";

export const passportConfig = () => {
    /**
     * Sign in using Username and Password.
     */
    passport.use(new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'username'
    }, (req, username, password, done) => {
        User.findOne({username: username.toLowerCase()})
            .then(user => {
                // @ts-ignore - Will throw on null user value, so ok
                user.comparePassword(password, (err, isMatch) => {
                    if (err || !isMatch) {
                        return done(null, false);
                    }
                    // @ts-ignore - will throw above if user is null
                    return done(null, user.toJSON());
                });
            })
            .catch(() => done(null, false, {message: "Credentials not accepted"}));
    }));

    /**
     * Sign in using JWT token
     */
    passport.use(new BearerStrategy(function (token, done) {
        try {
            const decoded: Object = verify(token, process.env.TOKEN_SECRET || '');
            User.findById((decoded as { id: string }).id) //.select('_id username email roles company')
                .populate({path: 'company', select: 'name'}).exec()
                .then(user => {
                    return done(null, user && user.toJSON() || false);
                })
                .catch(err => done(err))
        } catch (e) {
            return done(null, false);
        }
    }));

    passport.serializeUser((user: IUserDocument, done) => done(null, user._id));
    passport.deserializeUser((id, done) => User.findById(id, done));
};