import {
    cleanEnv, port, str, num
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
    });
}

export default validateEnv;