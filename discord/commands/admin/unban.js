const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to unban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      if (!user.banned) {
        return interaction.reply({
          content: `Player "${user.displayName}" is not banned.`,
          ephemeral: true
        });
      }

      user.banned = false;
      user.banReason = null;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Player Unbanned')
        .addFields(
          { name: 'Username', value: user.displayName, inline: true },
          { name: 'Account ID', value: user.accountId, inline: true },
          { name: 'Unbanned By', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Unban command error:', error);
      await interaction.reply({
        content: 'An error occurred while unbanning the player.',
        ephemeral: true
      });
    }
  }
};
