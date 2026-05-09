const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a player\'s level')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to set level for')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('New level')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const level = interaction.options.getInteger('level');

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      const oldLevel = user.level;
      user.level = level;
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('Level Set')
        .addFields(
          { name: 'Player', value: user.displayName, inline: true },
          { name: 'Old Level', value: oldLevel.toString(), inline: true },
          { name: 'New Level', value: level.toString(), inline: true },
          { name: 'Set By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Set level command error:', error);
      await interaction.reply({
        content: 'An error occurred while setting the level.',
        ephemeral: true
      });
    }
  }
};
