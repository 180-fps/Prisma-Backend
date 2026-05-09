const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your player statistics'),
  
  async execute(interaction) {
    try {
      const user = await User.findOne({ discordId: interaction.user.id });

      if (!user) {
        return interaction.reply({
          content: 'Account not linked. Use /link to connect your account.',
          ephemeral: true
        });
      }

      const kd = user.stats.deaths > 0 
        ? (user.stats.kills / user.stats.deaths).toFixed(2) 
        : user.stats.kills.toFixed(2);

      const winRate = user.stats.matches > 0
        ? ((user.stats.wins / user.stats.matches) * 100).toFixed(1)
        : '0.0';

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Stats for ${user.displayName}`)
        .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .addFields(
          { name: 'Level', value: user.level.toString(), inline: true },
          { name: 'V-Bucks', value: user.vbucks.toString(), inline: true },
          { name: 'XP', value: user.xp.toString(), inline: true },
          { name: 'Wins', value: user.stats.wins.toString(), inline: true },
          { name: 'Kills', value: user.stats.kills.toString(), inline: true },
          { name: 'Matches', value: user.stats.matches.toString(), inline: true },
          { name: 'K/D Ratio', value: kd, inline: true },
          { name: 'Win Rate', value: `${winRate}%`, inline: true },
          { name: 'Top 10', value: user.stats.top10.toString(), inline: true }
        )
        .setFooter({ text: `Account ID: ${user.accountId}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Stats command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching your stats.',
        ephemeral: true
      });
    }
  }
};
