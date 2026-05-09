const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('Look up player information')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to look up')
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

      const kd = user.stats.deaths > 0 
        ? (user.stats.kills / user.stats.deaths).toFixed(2) 
        : user.stats.kills.toFixed(2);

      const embed = new EmbedBuilder()
        .setColor(user.banned ? '#FF0000' : '#0099ff')
        .setTitle(`Player Info: ${user.displayName}`)
        .addFields(
          { name: 'Account ID', value: user.accountId, inline: false },
          { name: 'Email', value: user.email, inline: true },
          { name: 'Level', value: user.level.toString(), inline: true },
          { name: 'V-Bucks', value: user.vbucks.toString(), inline: true },
          { name: 'Wins', value: user.stats.wins.toString(), inline: true },
          { name: 'Kills', value: user.stats.kills.toString(), inline: true },
          { name: 'K/D', value: kd, inline: true },
          { name: 'Banned', value: user.banned ? 'Yes' : 'No', inline: true },
          { name: 'Discord Linked', value: user.discordId ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: new Date(user.createdAt).toLocaleDateString(), inline: true },
          { name: 'Last Login', value: new Date(user.lastLogin).toLocaleString(), inline: false }
        )
        .setTimestamp();

      if (user.banned && user.banReason) {
        embed.addFields({ name: 'Ban Reason', value: user.banReason, inline: false });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Lookup command error:', error);
      await interaction.reply({
        content: 'An error occurred while looking up the player.',
        ephemeral: true
      });
    }
  }
};
