import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../structure/Command";
import logsChannel from "./logs.channel.i";
import SetRole from "./role.i";
export default new Command({
  name: "set",
  description: "Set things up",
  options: [
    {
      name: "channel",
      description: "Set guild default channels",
      options: [
        {
          name: "logs",
          description: "Set the logs channel",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "channel",
              description: "target channel",
              type: ApplicationCommandOptionType.Channel,
              required: true,
            },
          ],
        },
      ],
      type: ApplicationCommandOptionType.SubcommandGroup,
    },
    {
      name: "role",
      description: "Set a role to a user",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
          required: true
        },
        {
          name: "role",
          description: "target role",
          type: ApplicationCommandOptionType.Role,
          required: true
        },
      ],
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async ({ client, interaction }) => {
    const subcommandGroupGet = interaction.options.getSubcommandGroup();
    const subcommandGet = interaction.options.getSubcommand();
    if (subcommandGroupGet === "channel") {
      if (subcommandGet === "logs") {
        logsChannel({ interaction });
      }
    } else if (subcommandGet === "role") {
      SetRole({ client, interaction });
    }
  },
});
