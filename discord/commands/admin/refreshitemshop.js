const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { rotateShop } = require('../../../services/shopRotation');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('refreshitemshop')
    .setDescription('Manually refresh the item shop')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      await interaction.deferReply();

      await rotateShop();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Item Shop Refreshed')
        .setDescription('The item shop has been manually refreshed with new items.')
        .addFields(
          { name: 'Refreshed By', value: interaction.user.tag, inline: true },
          { name: 'Time', value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Refresh shop command error:', error);
      await interaction.editReply({
        content: 'An error occurred while refreshing the shop.'
      });
    }
  }
};
