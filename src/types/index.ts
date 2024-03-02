import {
  ChatInputCommandInteraction,
  ChatInputApplicationCommandData,
} from "discord.js";
import ExtendedClient from "../structure/ExtendedClient";
interface RunType {
  client: ExtendedClient;
  interaction: ChatInputCommandInteraction;
}
type RunFunction = (option: RunType) => any;
export type Command = {
  run: RunFunction;
} & ChatInputApplicationCommandData;
