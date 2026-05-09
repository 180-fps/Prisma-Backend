const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Event = require('../../../models/Event');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('activateevent')
    .setDescription('Activate a game event')
    .addStringOption(option =>
      option.setName('eventtype')
        .setDescription('The event type to activate')
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

      let event = await Event.findOne({ eventType });

      if (!event) {
        event = new Event({
          eventId: `event_${Date.now()}`,
          eventType,
          name: eventType.replace(/_/g, ' ').toUpperCase(),
          description: `Active ${eventType} event`,
          active: true,
          startTime: new Date()
        });
      } else {
        event.active = true;
        event.startTime = new Date();
        event.endTime = null;
      }

      await event.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Event Activated')
        .addFields(
          { name: 'Event Type', value: event.name, inline: true },
          { name: 'Event ID', value: event.eventId, inline: true },
          { name: 'Started At', value: new Date().toLocaleString(), inline: true },
          { name: 'Activated By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Activate event command error:', error);
      await interaction.reply({
        content: 'An error occurred while activating the event.',
        ephemeral: true
      });
    }
  }
};
