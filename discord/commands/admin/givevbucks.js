const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('givevbucks')
    .setDescription('Give V-Bucks to a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to give V-Bucks to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of V-Bucks to give')
        .setRequired(true)
        .setMinValue(1))
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

      user.vbucks += amount;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('V-Bucks Given')
        .addFields(
          { name: 'Player', value: user.displayName, inline: true },
          { name: 'Amount Given', value: amount.toString(), inline: true },
          { name: 'New Balance', value: user.vbucks.toString(), inline: true },
          { name: 'Given By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Give V-Bucks command error:', error);
      await interaction.reply({
        content: 'An error occurred while giving V-Bucks.',
        ephemeral: true
      });
    }
  }
};
