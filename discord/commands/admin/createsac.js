const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');
const SACCode = require('../../../models/SACCode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createsac')
    .setDescription('Create a Support-A-Creator code')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('The SAC code (e.g., NINJA)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to assign the code to')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const code = interaction.options.getString('code').toUpperCase();
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

      const existingCode = await SACCode.findOne({ code });
      if (existingCode) {
        return interaction.reply({
          content: `SAC code "${code}" already exists.`,
          ephemeral: true
        });
      }

      const sacCode = new SACCode({
        code,
        accountId: user.accountId,
        displayName: user.displayName
      });

      await sacCode.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('SAC Code Created')
        .addFields(
          { name: 'Code', value: code, inline: true },
          { name: 'Creator', value: user.displayName, inline: true },
          { name: 'Account ID', value: user.accountId, inline: true },
          { name: 'Created By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Create SAC command error:', error);
      await interaction.reply({
        content: 'An error occurred while creating the SAC code.',
        ephemeral: true
      });
    }
  }
};
