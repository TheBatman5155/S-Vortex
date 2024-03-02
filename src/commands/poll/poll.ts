import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  ComponentType,
  Interaction,
} from "discord.js";
import { Embed, ErrorEmbed } from "../../components/Embed";
import { Command } from "../../structure/Command";
import ModalComponent from "./modal.i";
import StartPollComponent from "./s_poll.i";
import EndPoll from "./end_poll.i";
export default new Command({
  name: "poll",
  description: "create a poll",
  options: [
    {
      name: "start",
      description: "Start a poll",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "end",
      description: "End poll",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async ({ client, interaction }) => {
    const Subcommand = interaction.options.getSubcommand();
    const PollCollection: Collection<string, boolean> = new Collection();
    if (Subcommand == "end") {
      EndPoll({ collection: PollCollection });
    }
    const user = interaction.user;
    if (!interaction.memberPermissions.has("ManageMessages")) {
      const permission_embed = new ErrorEmbed({
        user,
        error: "Insufficient Permissions [ Manage Events ]",
        code: 403,
      });
      try {
        return interaction.reply({
          embeds: [permission_embed],
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      const EmbedSettings = "Settings: `Customize various aspects of the poll`";
      const SendPoll =
        "Send Poll: `Click the Send Poll button to initiate the poll`";
      const SettingsButton = new ButtonBuilder()
        .setCustomId("PollSettingsButton" + interaction.user.id)
        .setLabel("Settings")
        .setStyle(ButtonStyle.Primary);
      const SendPollButton = new ButtonBuilder()
        .setCustomId("PollSendPollButton" + interaction.user.id)
        .setLabel("Send Poll")
        .setStyle(ButtonStyle.Success);
      const PollEmbed = new Embed({ user })
        .setTitle("Poll / Setup")
        .setDescription(`${EmbedSettings}\n${SendPoll}`);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        SettingsButton,
        SendPollButton
      );
      try {
        const reply = await interaction.reply({
          embeds: [PollEmbed],
          components: [row],
        });
        const filter = (i: Interaction) => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter,
        });
        collector.on("collect", (int) => {
          if (int.customId === "PollSettingsButton" + interaction.user.id) {
            ModalComponent({
              interaction: int,
              defaultInteraction: interaction,
            });
          } else {
            StartPollComponent({
              interaction: int,
              defaultInteraction: interaction,
              collection: PollCollection,
              client,
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  },
});
