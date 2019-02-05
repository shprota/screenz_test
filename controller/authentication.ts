import express from 'express';
import Controller from "../interfaces/controller";
import {checkAuth} from "../middleware/auth";
import {User} from "../models/user";
// @ts-ignore
import mongooseError from 'mongoose-error';
import {sign} from "jsonwebtoken";
import {Environment} from "../interfaces/env";
import {IUserDocument} from "../interfaces/user";
import passport from "passport";
import {RegisterDto} from "./auth.dto";

class AuthenticationController implements Controller {
    public path = '';
    public router = express.Router();

    constructor(private env: Environment) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/register`, this.register.bind(this));
        this.router.post(`${this.path}/token`, passport.authenticate('local', {session: false}), this.renewToken.bind(this));
        this.router.post(`${this.path}/login`, passport.authenticate('local', {session: true}), this.login.bind(this));
        this.router.get(`${this.path}/renew_token`, checkAuth, this.renewToken.bind(this));
    }

    private async register(req: express.Request, res: express.Response) {
        const data: RegisterDto = req.body;
        try {
            let user: IUserDocument = new User(data);
            user.role = 'client';
            user = await user.save();
            return res.json({
                token: this.makeToken(user),
                expiresIn: process.env['TOKEN_TTL'],
                user: user.toJSON()
            });
        } catch (err) {
            const mError = mongooseError(err, {});
            let error = '';
            if (err.name === 'ValidationError') {
                error = mError['message'];
                return res.status(422).json({error: error, errors: mError.errors});
            } else if (typeof err === 'string') {
                error = err;
            } else {
                error = err.message;
            }
            return res.status(500).json({error: error});
        }
    }

    private async login(req: express.Request, res: express.Response) {
        res.json({success: true});
    }

    private renewToken(req: express.Request, res: express.Response) {
        return res.json({
            token: this.makeToken(req.user),
            expiresIn: this.env['TOKEN_TTL'],
            user: req.user
        });
    }

    private makeToken(user: IUserDocument) {
        return sign({
                id: user._id,
            }, this.env.TOKEN_SECRET,
            {expiresIn: this.env.TOKEN_TTL});
    }
}

export default AuthenticationController;