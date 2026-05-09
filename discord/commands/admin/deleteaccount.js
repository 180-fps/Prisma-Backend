const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteaccount')
    .setDescription('Delete a player account (PERMANENT)')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to delete')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('confirm')
        .setDescription('Type "CONFIRM" to proceed')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const confirm = interaction.options.getString('confirm');

      if (confirm !== 'CONFIRM') {
        return interaction.reply({
          content: 'You must type "CONFIRM" to delete an account.',
          ephemeral: true
        });
      }

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      const accountId = user.accountId;
      const displayName = user.displayName;

      await User.deleteOne({ accountId });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Account Deleted')
        .addFields(
          { name: 'Username', value: displayName, inline: true },
          { name: 'Account ID', value: accountId, inline: true },
          { name: 'Deleted By', value: interaction.user.tag, inline: false }
        )
        .setFooter({ text: 'This action is permanent and cannot be undone' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Delete account command error:', error);
      await interaction.reply({
        content: 'An error occurred while deleting the account.',
        ephemeral: true
      });
    }
  }
};
