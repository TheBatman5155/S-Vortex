import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../../structure/Command";
import SetRole from "./role.i";
export default new Command({
  name: "remove",
  description: "Remove",
  options: [
    {
      name: "role",
      description: "Set a role to a user",
      options: [
        {
          name: "user",
          description: "target user",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "role",
          description: "target role",
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
      ],
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async ({ client, interaction }) => {
    const subcommandGroupGet = interaction.options.getSubcommandGroup();
    const subcommandGet = interaction.options.getSubcommand();
    if (subcommandGet === "role") {
      SetRole({ client, interaction });
    }
  },
});
