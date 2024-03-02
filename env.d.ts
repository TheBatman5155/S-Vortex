import { RESTOptions } from "discord.js"
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string,
            DISCORD_TOKEN: string,
            DISCORD_CLIENT_ID: string,
        }
    }
}
export {}