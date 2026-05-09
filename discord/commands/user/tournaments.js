const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Tournament = require('../../../models/Tournament');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tournaments')
    .setDescription('View active tournaments'),
  
  async execute(interaction) {
    try {
      const tournaments = await Tournament.find({
        status: { $in: ['upcoming', 'active'] }
      }).limit(5).sort({ startTime: 1 });

      if (tournaments.length === 0) {
        return interaction.reply({
          content: 'No active tournaments at the moment.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Active Tournaments')
        .setDescription('Current and upcoming tournaments')
        .setTimestamp();

      tournaments.forEach(t => {
        const startTime = new Date(t.startTime).toLocaleString();
        const endTime = new Date(t.endTime).toLocaleString();
        
        embed.addFields({
          name: t.name,
          value: `**Status:** ${t.status}\n**Participants:** ${t.participants.length}/${t.maxPlayers}\n**Starts:** ${startTime}\n**Ends:** ${endTime}`,
          inline: false
        });
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Tournaments command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching tournaments.',
        ephemeral: true
      });
    }
  }
};
