import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import errorHandler from 'errorhandler';
import prodErrorHandler from './middleware/error';
import session from "express-session";
import connect_redis from "connect-redis";

import mongoose from 'mongoose';
import passport from 'passport';
import {passportConfig} from "./config/passport";
import {Environment} from "./interfaces/env";
import Controller from "./interfaces/controller";
import bluebird from "bluebird";
// @ts-ignore
import Type = module;
import expressValidator from "express-validator";

/*
*/

mongoose.Promise = bluebird;
const isDev = process.env.NODE_ENV === 'development';
const RedisStore = connect_redis(session);

class App {
    public app: express.Application;

    constructor(private env: Environment, controllers: Type<Controller>[]) {
        this.app = express();
        this.initMW();
        this.initControllers(controllers);
    }

    private initMW() {
        this.app.set('env', this.env);

        passportConfig();

        this.app.enable("trust proxy");
        this.app.use(require('express-status-monitor')());
        this.app.use(logger('dev'));
        this.app.use(session({
            store: new RedisStore({
                host: this.env.REDIS_HOST,
                port: this.env.REDIS_PORT,
            }),
            secret: this.env.TOKEN_SECRET,
            resave: false,
            saveUninitialized: false
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(cookieParser());
        this.app.use(expressValidator());
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.disable('x-powered-by');
        this.app.use(isDev ? errorHandler() : prodErrorHandler);

    }

    private async connectDb() {
        mongoose.set('useFindAndModify', false);
        mongoose.set('useCreateIndex', true);
        mongoose.set('useNewUrlParser', true);

        mongoose.connection.on('error', (err: any) => {
            console.error(err);
            console.log('%s MongoDB connection error. Please make sure MongoDB is running.', '✗');
            process.exit();
        });
        return mongoose.connect(this.env.MONGODB_URI || '');

    }

    private initControllers(controllers: Type<Controller>[]) {
        controllers.forEach((controller) => {
            const ctl = new controller(this.env);
            this.app.use('/api', ctl.router);
        });
    }

    public listen() {
        this.connectDb()
            .then(() => {
                this.app.listen(this.env.PORT, () => {
                    console.log(`App listening on the port ${this.env.PORT}`);
                });
            });
    }
}

export default App;