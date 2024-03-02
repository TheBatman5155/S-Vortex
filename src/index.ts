import dotenv from "dotenv";
import ExtendedClient from "./structure/ExtendedClient";
dotenv.config();
export const client = new ExtendedClient();
client.start();
client.loadModule();
client.deploy();