import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import App from './app';
import AuthenticationController from "./controller/authentication";
import UserController from "./controller/user";
import BookGenreController from "./controller/book.genre";
import BookController from "./controller/book";
require('source-map-support').install();

dotenv.load({path: '.env.example'});

const env = validateEnv();

const app = new App(env, [AuthenticationController, UserController, BookGenreController, BookController]);

app.listen();