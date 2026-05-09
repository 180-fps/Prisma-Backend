const cron = require('node-cron');
const User = require('../models/User');
const config = require('../config.json');

async function performSeasonalReset() {
  try {
    console.log('[Seasonal Reset] Starting seasonal reset...');

    const users = await User.find({});

    for (const user of users) {
      user.stats.kills = 0;
      user.stats.deaths = 0;
      user.stats.wins = 0;
      user.stats.matches = 0;
      user.stats.top10 = 0;
      user.stats.top25 = 0;

      user.arena.points = 0;
      user.arena.division = 'Open League';
      user.arena.matches = 0;

      if (!config.seasonal.keepVbucks) {
        user.vbucks = config.gameplay.startingVbucks || 1000;
      }

      if (!config.seasonal.keepCosmetics) {
        user.inventory = {
          skins: [],
          backblings: [],
          pickaxes: [],
          gliders: [],
          emotes: [],
          wraps: [],
          contrails: [],
          loadingScreens: [],
          banners: []
        };

        user.equipped = {
          skin: 'CID_001_Athena_Commando_F_Default',
          backbling: '',
          pickaxe: 'DefaultPickaxe',
          glider: 'DefaultGlider',
          contrail: '',
          loadingScreen: '',
          banner: ''
        };
      }

      user.seasonStats.season = config.server.season;
      user.seasonStats.chapter = config.server.chapter;
      user.seasonStats.resetAt = new Date();

      await user.save();
    }

    console.log(`[Seasonal Reset] Reset completed for ${users.length} users`);
  } catch (error) {
    console.error('[Seasonal Reset] Error:', error);
  }
}

function start() {
  if (!config.seasonal.autoReset) {
    console.log('[Seasonal Reset] Auto-reset disabled');
    return;
  }

  const resetDay = config.seasonal.resetDay || 1;
  const cronExpression = `0 0 ${resetDay} * *`;

  cron.schedule(cronExpression, () => {
    console.log('[Seasonal Reset] Running scheduled seasonal reset');
    performSeasonalReset();
  });

  console.log(`[Seasonal Reset] Scheduled for day ${resetDay} of each month`);
}

module.exports = { start, performSeasonalReset };
