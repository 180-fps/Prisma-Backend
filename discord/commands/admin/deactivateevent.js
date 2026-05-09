const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Event = require('../../../models/Event');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deactivateevent')
    .setDescription('Deactivate a game event')
    .addStringOption(option =>
      option.setName('eventtype')
        .setDescription('The event type to deactivate')
        .setRequired(true)
        .addChoices(
          { name: 'Double XP', value: 'double_xp' },
          { name: 'Double V-Bucks', value: 'double_vbucks' },
          { name: 'Special Tournament', value: 'special_tournament' },
          { name: 'Limited Time Mode', value: 'ltm' },
          { name: 'Holiday Event', value: 'holiday' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const eventType = interaction.options.getString('eventtype');

      const event = await Event.findOne({ eventType });

      if (!event) {
        return interaction.reply({
          content: `Event type "${eventType}" not found.`,
          ephemeral: true
        });
      }

      if (!event.active) {
        return interaction.reply({
          content: `Event "${event.name}" is already inactive.`,
          ephemeral: true
        });
      }

      event.active = false;
      event.endTime = new Date();
      await event.save();

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Event Deactivated')
        .addFields(
          { name: 'Event Type', value: event.name, inline: true },
          { name: 'Event ID', value: event.eventId, inline: true },
          { name: 'Ended At', value: new Date().toLocaleString(), inline: true },
          { name: 'Deactivated By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Deactivate event command error:', error);
      await interaction.reply({
        content: 'An error occurred while deactivating the event.',
        ephemeral: true
      });
    }
  }
};
