const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setvbucks')
    .setDescription('Set a player\'s V-Bucks balance')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to set V-Bucks for')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('New V-Bucks balance')
        .setRequired(true)
        .setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const amount = interaction.options.getInteger('amount');

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      const oldBalance = user.vbucks;
      user.vbucks = amount;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('V-Bucks Balance Set')
        .addFields(
          { name: 'Player', value: user.displayName, inline: true },
          { name: 'Old Balance', value: oldBalance.toString(), inline: true },
          { name: 'New Balance', value: amount.toString(), inline: true },
          { name: 'Set By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Set V-Bucks command error:', error);
      await interaction.reply({
        content: 'An error occurred while setting V-Bucks.',
        ephemeral: true
      });
    }
  }
};
