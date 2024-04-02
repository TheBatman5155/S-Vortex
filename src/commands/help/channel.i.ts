import { ChatInputCommandInteraction } from "discord.js";
import { Embed } from "../../components/Embed";

export default function run({
  interaction,
}: {
  interaction: ChatInputCommandInteraction;
}) {
  const user = interaction.user;
  const commands = ["logs"];
  const commandMap = commands.map((cmd) => {
    return "`" + cmd + "`";
  });
  const ChannelEmbed = new Embed({ user })
    .setTitle("Help / Set / Channel")
    .setDescription("> List of `/set channel` sub-commands")
    .addFields({ name: "Commands", value: `${commandMap}` });
  try {
    interaction.reply({
      embeds: [ChannelEmbed],
    });
  } catch (error) {}
}
