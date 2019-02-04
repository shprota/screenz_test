export interface Environment {
    NODE_ENV: string,
    MONGODB_URI: string,
    DEBUG: string
    TOKEN_SECRET: string,
    TOKEN_TTL: number,
    PORT: number,
    REDIS_HOST: string,
    REDIS_PORT: number,
}