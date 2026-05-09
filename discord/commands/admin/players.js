const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('players')
    .setDescription('View online player count')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const totalUsers = await User.countDocuments();
      const onlineUsers = await User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });
      const activeToday = await User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Player Statistics')
        .addFields(
          { name: 'Online Now', value: onlineUsers.toString(), inline: true },
          { name: 'Active Today', value: activeToday.toString(), inline: true },
          { name: 'Total Registered', value: totalUsers.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Players command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching player count.',
        ephemeral: true
      });
    }
  }
};
