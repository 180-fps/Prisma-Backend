const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SACCode = require('../../../models/SACCode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletesac')
    .setDescription('Delete a Support-A-Creator code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The SAC code to delete')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const code = interaction.options.getString('code').toUpperCase();

      const sacCode = await SACCode.findOne({ code });

      if (!sacCode) {
        return interaction.reply({
          content: `SAC code "${code}" not found.`,
          ephemeral: true
        });
      }

      const displayName = sacCode.displayName;
      const uses = sacCode.uses;
      const earnings = sacCode.earnings;

      await SACCode.deleteOne({ code });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('SAC Code Deleted')
        .addFields(
          { name: 'Code', value: code, inline: true },
          { name: 'Creator', value: displayName, inline: true },
          { name: 'Total Uses', value: uses.toString(), inline: true },
          { name: 'Total Earnings', value: earnings.toString(), inline: true },
          { name: 'Deleted By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Delete SAC command error:', error);
      await interaction.reply({
        content: 'An error occurred while deleting the SAC code.',
        ephemeral: true
      });
    }
  }
};
