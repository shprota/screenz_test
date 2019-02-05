import {
    cleanEnv, port, str, num, host
} from 'envalid';
import {Environment} from "../interfaces/env";

function validateEnv() {
    return cleanEnv<Environment>(process.env, {
        NODE_ENV: str(),
        MONGODB_URI: str(),
        DEBUG: str(),
        TOKEN_SECRET: str(),
        TOKEN_TTL: num(),
        PORT: port({default: 3000}),
        REDIS_HOST: host({default: 'localhost'}),
        REDIS_PORT: port({default: 6379}),
    });
}

export default validateEnv;