import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../structure/Command";
import ChannelHelp from "./channel.i";
export default new Command({
  name: "help",
  description: "Receive a list of commands",
  options: [
    {
      name: "set",
      description: "More about the set commands",
      options: [
        {
          name: "channel",
          description: "More about the set channel commands",
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
      type: ApplicationCommandOptionType.SubcommandGroup,
    }
  ],
  run: async ({ interaction }) => {
    const subcommandGroupGet = interaction.options.getSubcommandGroup();
    const subcommandGet = interaction.options.getSubcommand();
    if (subcommandGroupGet === "set") {
      if (subcommandGet === "channel") {
        ChannelHelp ({ interaction });
      }
    }
  },
});
