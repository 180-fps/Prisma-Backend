const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');
const config = require('../../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('View server status')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const totalUsers = await User.countDocuments();
      const bannedUsers = await User.countDocuments({ banned: true });
      const activeUsers = await User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Server Status')
        .addFields(
          { name: 'Status', value: 'Online', inline: true },
          { name: 'Version', value: config.server.version, inline: true },
          { name: 'Season', value: `Chapter ${config.server.chapter} Season ${config.server.season}`, inline: true },
          { name: 'Total Users', value: totalUsers.toString(), inline: true },
          { name: 'Active Users (24h)', value: activeUsers.toString(), inline: true },
          { name: 'Banned Users', value: bannedUsers.toString(), inline: true },
          { name: 'Uptime', value: `${hours}h ${minutes}m`, inline: true },
          { name: 'Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Status command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching server status.',
        ephemeral: true
      });
    }
  }
};
