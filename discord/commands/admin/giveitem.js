const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveitem')
    .setDescription('Give an item to a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The username to give the item to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('itemid')
        .setDescription('Item ID (e.g., CID_028_Athena_Commando_F)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Item type')
        .setRequired(true)
        .addChoices(
          { name: 'Skin', value: 'skin' },
          { name: 'Backbling', value: 'backbling' },
          { name: 'Pickaxe', value: 'pickaxe' },
          { name: 'Glider', value: 'glider' },
          { name: 'Emote', value: 'emote' },
          { name: 'Wrap', value: 'wrap' },
          { name: 'Contrail', value: 'contrail' },
          { name: 'Loading Screen', value: 'loadingScreen' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    try {
      const username = interaction.options.getString('username');
      const itemId = interaction.options.getString('itemid');
      const itemType = interaction.options.getString('type');

      const user = await User.findOne({ 
        displayName: { $regex: new RegExp(username, 'i') }
      });

      if (!user) {
        return interaction.reply({
          content: `Player "${username}" not found.`,
          ephemeral: true
        });
      }

      const inventoryKey = itemType + 's';
      
      if (!user.inventory[inventoryKey]) {
        user.inventory[inventoryKey] = [];
      }

      if (user.inventory[inventoryKey].includes(itemId)) {
        return interaction.reply({
          content: `Player "${user.displayName}" already owns this item.`,
          ephemeral: true
        });
      }

      user.inventory[inventoryKey].push(itemId);
      await user.save();

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Item Given')
        .addFields(
          { name: 'Player', value: user.displayName, inline: true },
          { name: 'Item ID', value: itemId, inline: true },
          { name: 'Item Type', value: itemType, inline: true },
          { name: 'Given By', value: interaction.user.tag, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Give item command error:', error);
      await interaction.reply({
        content: 'An error occurred while giving the item.',
        ephemeral: true
      });
    }
  }
};
