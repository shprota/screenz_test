import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import App from './app';
import AuthenticationController from "./controller/authentication";
import UserController from "./controller/user";
import ToolController from "./controller/tools";
require('source-map-support').install();

dotenv.load({path: '.env.example'});

const env = validateEnv();

const app = new App(env, [AuthenticationController, UserController, ToolController]);

app.listen();