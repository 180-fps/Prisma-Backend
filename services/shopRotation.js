const cron = require('node-cron');
const Shop = require('../models/Shop');
const { v4: uuidv4 } = require('uuid');
const config = require('../config.json');

const sampleItems = [
  { itemId: 'CID_028_Athena_Commando_F', name: 'Renegade Raider', type: 'skin', rarity: 'legendary', price: 1200 },
  { itemId: 'CID_029_Athena_Commando_F_Halloween', name: 'Ghoul Trooper', type: 'skin', rarity: 'epic', price: 1500 },
  { itemId: 'CID_030_Athena_Commando_M_Halloween', name: 'Skull Trooper', type: 'skin', rarity: 'legendary', price: 1500 },
  { itemId: 'CID_035_Athena_Commando_M_Winter', name: 'Nog Ops', type: 'skin', rarity: 'rare', price: 800 },
  { itemId: 'CID_113_Athena_Commando_M_BlueSquire', name: 'Blue Squire', type: 'skin', rarity: 'rare', price: 800 },
  { itemId: 'CID_175_Athena_Commando_M_Celestial', name: 'Galaxy', type: 'skin', rarity: 'epic', price: 2000 },
  { itemId: 'BID_001_BlueSquire', name: 'Blue Shield', type: 'backbling', rarity: 'rare', price: 200 },
  { itemId: 'BID_002_Brite', name: 'Brite Bag', type: 'backbling', rarity: 'rare', price: 200 },
  { itemId: 'Pickaxe_ID_015_WinterCamo', name: 'Candy Axe', type: 'pickaxe', rarity: 'legendary', price: 1500 },
  { itemId: 'Pickaxe_ID_016_Scythe', name: 'Reaper', type: 'pickaxe', rarity: 'legendary', price: 800 },
  { itemId: 'Glider_ID_001_Umbrella', name: 'Umbrella', type: 'glider', rarity: 'uncommon', price: 500 },
  { itemId: 'Glider_ID_015_Dragon', name: 'Dragon', type: 'glider', rarity: 'legendary', price: 2000 },
  { itemId: 'EID_DanceMoves', name: 'Dance Moves', type: 'emote', rarity: 'rare', price: 500 },
  { itemId: 'EID_Floss', name: 'Floss', type: 'emote', rarity: 'rare', price: 500 },
  { itemId: 'EID_TakeTheL', name: 'Take the L', type: 'emote', rarity: 'uncommon', price: 200 },
  { itemId: 'Wrap_001_Magma', name: 'Magma', type: 'wrap', rarity: 'rare', price: 300 },
  { itemId: 'Wrap_002_Ice', name: 'Ice', type: 'wrap', rarity: 'rare', price: 300 }
];

async function rotateShop() {
  try {
    await Shop.updateMany({ active: true }, { active: false });

    const featuredCount = config.shop.featuredItemsCount || 6;
    const dailyCount = config.shop.dailyItemsCount || 8;

    const shuffled = [...sampleItems].sort(() => 0.5 - Math.random());
    const featured = shuffled.slice(0, featuredCount).map(item => ({
      ...item,
      section: 'featured',
      available: true,
      rotationDate: new Date(),
      expiresAt: new Date(Date.now() + config.shop.rotationHours * 60 * 60 * 1000)
    }));

    const daily = shuffled.slice(featuredCount, featuredCount + dailyCount).map(item => ({
      ...item,
      section: 'daily',
      available: true,
      rotationDate: new Date(),
      expiresAt: new Date(Date.now() + config.shop.rotationHours * 60 * 60 * 1000)
    }));

    const rotationId = uuidv4().replace(/-/g, '');
    const newShop = new Shop({
      rotationId,
      items: [...featured, ...daily],
      expiresAt: new Date(Date.now() + config.shop.rotationHours * 60 * 60 * 1000),
      active: true
    });

    await newShop.save();
    console.log(`[Shop Rotation] New shop rotation created: ${rotationId}`);
  } catch (error) {
    console.error('[Shop Rotation] Error:', error);
  }
}

function start() {
  if (!config.shop.autoRotate) {
    console.log('[Shop Rotation] Auto-rotation disabled');
    return;
  }

  rotateShop();

  const cronExpression = `0 */${config.shop.rotationHours} * * *`;
  cron.schedule(cronExpression, () => {
    console.log('[Shop Rotation] Running scheduled rotation');
    rotateShop();
  });

  console.log(`[Shop Rotation] Scheduled every ${config.shop.rotationHours} hours`);
}

module.exports = { start, rotateShop };
