import validateEnv from "../utils/validateEnv";

const env = validateEnv();

export const RedisSmqConfig  = {
    namespace: 'my_project_name',
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        connect_timeout: 3600000,
    },
    log: {
        enabled: 0,
        options: {
            level: 'trace',
        },
    },
    monitor: {
        enabled: false,
        host: '127.0.0.1',
        port: 3000,
    },
};