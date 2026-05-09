const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your Fortnite account'),
  
  async execute(interaction) {
    try {
      const authUrl = `${process.env.DISCORD_REDIRECT_URI?.replace('/callback', '') || 'http://localhost:3551/api/auth/discord'}`;

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Link Your Account')
        .setDescription('Click the link below to connect your Discord account with your Fortnite account.')
        .addFields({
          name: 'Authentication URL',
          value: `[Click here to authenticate](${authUrl})`
        })
        .setFooter({ text: 'This link will redirect you to Discord OAuth2' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Link command error:', error);
      await interaction.reply({
        content: 'An error occurred while generating the link.',
        ephemeral: true
      });
    }
  }
};
