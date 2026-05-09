const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vbucks')
    .setDescription('Check your V-Bucks balance'),
  
  async execute(interaction) {
    try {
      const user = await User.findOne({ discordId: interaction.user.id });

      if (!user) {
        return interaction.reply({
          content: 'Account not linked. Use /link to connect your account.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('V-Bucks Balance')
        .setDescription(`**${user.displayName}** has **${user.vbucks}** V-Bucks`)
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .setFooter({ text: `Account ID: ${user.accountId}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('V-Bucks command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching your V-Bucks balance.',
        ephemeral: true
      });
    }
  }
};
