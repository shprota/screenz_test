import passport = require("passport");
import express, {NextFunction} from 'express';

export const checkAuth = (req: express.Request, res: express.Response, next: NextFunction) => {
    if (!req.isAuthenticated())
        return passport.authenticate('bearer', {session: false})(req, res, next);
    return next();
};
