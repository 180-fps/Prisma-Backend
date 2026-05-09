const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Shop = require('../../../models/Shop');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('View the current item shop'),
  
  async execute(interaction) {
    try {
      const currentShop = await Shop.findOne({ 
        active: true,
        expiresAt: { $gt: new Date() }
      });

      if (!currentShop) {
        return interaction.reply({
          content: 'No active shop rotation available.',
          ephemeral: true
        });
      }

      const featuredItems = currentShop.items.filter(i => i.section === 'featured');
      const dailyItems = currentShop.items.filter(i => i.section === 'daily');

      const timeRemaining = Math.floor((currentShop.expiresAt - new Date()) / 1000 / 60 / 60);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Item Shop')
        .setDescription(`Rotation expires in ${timeRemaining} hours`)
        .addFields(
          { 
            name: 'Featured Items', 
            value: featuredItems.length > 0 
              ? featuredItems.map(i => `**${i.name}** - ${i.price} V-Bucks (${i.rarity})`).join('\n')
              : 'No featured items',
            inline: false
          },
          { 
            name: 'Daily Items', 
            value: dailyItems.length > 0
              ? dailyItems.map(i => `**${i.name}** - ${i.price} V-Bucks (${i.rarity})`).join('\n')
              : 'No daily items',
            inline: false
          }
        )
        .setFooter({ text: `Rotation ID: ${currentShop.rotationId}` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Shop command error:', error);
      await interaction.reply({
        content: 'An error occurred while fetching the shop.',
        ephemeral: true
      });
    }
  }
};
