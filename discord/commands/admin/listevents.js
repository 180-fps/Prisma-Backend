const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Event = require('../../../models/Event');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listevents')
    .setDescription('List all game events')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const events = await Event.find().sort({ createdAt: -1 });

      if (events.length === 0) {
        return interaction.reply({
          content: 'No events found.',
          ephemeral: true
        });
      }

      const activeEvents = events.filter(e => e.active);
      const inactiveEvents = events.filter(e => !e.active);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Game Events')
        .setDescription(`Total Events: ${events.length}`)
        .setTimestamp();

      if (activeEvents.length > 0) {
        embed.addFields({
          name: 'Active Events',
          value: activeEvents.map(e => 
            `**${e.name}** (${e.eventType})\nStarted: ${new Date(e.startTime).toLocaleString()}`
          ).join('\n\n'),
          inline: false
        });
      }

      if (inactiveEvents.length > 0) {
        embed.addFields({
          name: 'Inactive Events',
          value: inactiveEvents.slice(0, 5).map(e => 
            `**${e.name}** (${e.eventType})`
          ).join('\n'),
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('List events command error:', error);
      await interaction.reply({
        content: 'An error occurred while listing events.',
        ephemeral: true
      });
    }
  }
};
