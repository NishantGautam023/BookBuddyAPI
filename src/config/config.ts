import {config as conf} from 'dotenv'

conf()

const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    Cloudinary_cloud: process.env.CLOUDINARY_CLOUD,
    Cloudinary_API_KEY: process.env.CLOUDINARY_API_KEY,
    Cloudinary_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    frontendDomain: process.env.FRONTEND_DOMAIN,
    databaseName: process.env.DB_NAME,
    collectionName:process.env.COLLECTION_NAME,
    postHog: process.env.POSTHOG_ANALYTICS,

}


export const config = Object.freeze(_config)
