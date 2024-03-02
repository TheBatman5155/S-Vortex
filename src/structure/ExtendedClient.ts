import {
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { Event } from "./Event";
import { Command } from "../types";
import path from "path";
import { readdirSync } from "fs";
const { Guilds } = GatewayIntentBits;
const Intents: GatewayIntentBits[] = [Guilds];
export default class extends Client {
  public commands = new Collection<string, Command>();
  public events = new Collection<string, Command>();
  public commandsArray: Command[] = [];
  constructor() {
    super({
      intents: Intents,
    });
  }
  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }
  public async loadModule() {
    // Commands
    const commandPath = path.join(__dirname, "..", "commands");
    readdirSync(commandPath)
    .forEach(async (folder) => {
      const folderPath = path.join(commandPath, folder);
      readdirSync(folderPath).filter((file) => !file.includes(".i"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js")).forEach((file) => {
        let command: Command = require(`${folderPath}/${file}`).default;
        this.commands.set(command.name, command);
        this.commandsArray.push(command);
      })
      });
    // Events
    const eventPath = path.join(__dirname, "..", "events");
    readdirSync(eventPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach(async (file) => {
        const filePath = `${eventPath}/${file}`;
        const event: Event<keyof ClientEvents> = await this.importFile(
          filePath
        );
        this.on(event.event, event.run);
      });
  }
  public command = class {
    public run: Command["run"];
    constructor(data: Command) {
      this.run = data.run;
    }
  };
  public async deploy() {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    try {
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        {
          body: this.commandsArray,
        }
      );
      console.log("Completed loading commands");
    } catch (e) {
      console.log("Failed to load commands");
      console.error(e);
    }
  }
  public async start() {
    await this.login(process.env.DISCORD_TOKEN);
  }
}
