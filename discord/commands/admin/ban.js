const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      if (user.banned) {
        return interaction.reply({
          content: `Player "${user.displayName}" is already banned.`,
          ephemeral: true
        });
      }

      user.banned = true;
      user.banReason = reason;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Player Banned')
        .addFields(
          { name: 'Username', value: user.displayName, inline: true },
          { name: 'Account ID', value: user.accountId, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Banned By', value: interaction.user.tag, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Ban command error:', error);
      await interaction.reply({
        content: 'An error occurred while banning the player.',
        ephemeral: true
      });
    }
  }
};
