const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { authenticateToken } = require('../../middleware/auth');

const profileIds = [
  'athena',
  'common_core',
  'common_public',
  'profile0',
  'collections',
  'creative',
  'metadata'
];

function createProfile(profileId, user) {
  const baseProfile = {
    profileRevision: 1,
    profileId: profileId,
    profileChangesBaseRevision: 1,
    profileChanges: [],
    profileCommandRevision: 1,
    serverTime: new Date().toISOString(),
    responseVersion: 1
  };

  if (profileId === 'athena') {
    return {
      ...baseProfile,
      items: generateAthenaItems(user),
      stats: {
        attributes: {
          season_match_boost: 0,
          loadouts: ['sandbox_loadout'],
          mfa_reward_claimed: true,
          rested_xp_overflow: 0,
          quest_manager: {},
          book_level: user.level || 1,
          season_num: 5,
          book_xp: user.xp || 0,
          permissions: [],
          season: {
            numWins: user.stats.wins || 0,
            numHighBracket: user.stats.top10 || 0,
            numLowBracket: user.stats.top25 || 0
          },
          vote_data: {},
          lifetime_wins: user.stats.wins || 0,
          party_assist_quest: '',
          purchased_battle_pass_tier_offers: {},
          rested_xp_exchange: 0,
          level: user.level || 1,
          xp_overflow: 0,
          rested_xp: 0,
          rested_xp_mult: 0,
          accountLevel: user.level || 1,
          competitive_identity: {},
          inventory_limit_bonus: 0,
          last_applied_loadout: 'sandbox_loadout',
          daily_rewards: {},
          xp: user.xp || 0,
          season_friend_match_boost: 0,
          active_loadout_index: 0,
          favorite_character: user.equipped.skin || 'CID_001_Athena_Commando_F_Default',
          favorite_backpack: user.equipped.backbling || '',
          favorite_pickaxe: user.equipped.pickaxe || 'DefaultPickaxe',
          favorite_glider: user.equipped.glider || 'DefaultGlider',
          favorite_skydivecontrail: user.equipped.contrail || '',
          favorite_loadingscreen: user.equipped.loadingScreen || '',
          favorite_musicpack: '',
          favorite_dance: []
        }
      }
    };
  }

  if (profileId === 'common_core') {
    return {
      ...baseProfile,
      items: generateCommonCoreItems(user),
      stats: {
        attributes: {
          survey_data: {},
          personal_offers: {},
          intro_game_played: true,
          import_friends_claimed: {},
          mtx_purchase_history: {
            refundsUsed: 0,
            refundCredits: 3,
            purchases: []
          },
          undo_cooldowns: [],
          mtx_affiliate_set_time: new Date().toISOString(),
          inventory_limit_bonus: 0,
          current_mtx_platform: 'EpicPC',
          mtx_affiliate: '',
          weekly_purchases: {},
          daily_purchases: {},
          ban_history: {},
          in_app_purchases: {},
          permissions: [],
          undo_timeout: '9999-12-31T23:59:59.999Z',
          monthly_purchases: {},
          allowed_to_send_gifts: true,
          mfa_enabled: true,
          allowed_to_receive_gifts: true,
          gift_history: {}
        }
      }
    };
  }

  return baseProfile;
}

function generateAthenaItems(user) {
  const items = {};

  const defaultItems = [
    'AthenaCharacter:CID_001_Athena_Commando_F_Default',
    'AthenaPickaxe:DefaultPickaxe',
    'AthenaGlider:DefaultGlider',
    'AthenaDance:EID_DanceMoves'
  ];

  defaultItems.forEach((itemId, index) => {
    items[`default_${index}`] = {
      templateId: itemId,
      attributes: {
        max_level_bonus: 0,
        level: 1,
        item_seen: true,
        xp: 0,
        variants: [],
        favorite: false
      },
      quantity: 1
    };
  });

  if (user.inventory.skins) {
    user.inventory.skins.forEach((skinId, index) => {
      items[`skin_${index}`] = {
        templateId: `AthenaCharacter:${skinId}`,
        attributes: {
          max_level_bonus: 0,
          level: 1,
          item_seen: true,
          xp: 0,
          variants: [],
          favorite: false
        },
        quantity: 1
      };
    });
  }

  if (user.inventory.pickaxes) {
    user.inventory.pickaxes.forEach((pickaxeId, index) => {
      items[`pickaxe_${index}`] = {
        templateId: `AthenaPickaxe:${pickaxeId}`,
        attributes: {
          max_level_bonus: 0,
          level: 1,
          item_seen: true,
          xp: 0,
          variants: [],
          favorite: false
        },
        quantity: 1
      };
    });
  }

  if (user.inventory.gliders) {
    user.inventory.gliders.forEach((gliderId, index) => {
      items[`glider_${index}`] = {
        templateId: `AthenaGlider:${gliderId}`,
        attributes: {
          max_level_bonus: 0,
          level: 1,
          item_seen: true,
          xp: 0,
          variants: [],
          favorite: false
        },
        quantity: 1
      };
    });
  }

  if (user.inventory.backblings) {
    user.inventory.backblings.forEach((backblingId, index) => {
      items[`backbling_${index}`] = {
        templateId: `AthenaBackpack:${backblingId}`,
        attributes: {
          max_level_bonus: 0,
          level: 1,
          item_seen: true,
          xp: 0,
          variants: [],
          favorite: false
        },
        quantity: 1
      };
    });
  }

  if (user.inventory.emotes) {
    user.inventory.emotes.forEach((emoteId, index) => {
      items[`emote_${index}`] = {
        templateId: `AthenaDance:${emoteId}`,
        attributes: {
          max_level_bonus: 0,
          level: 1,
          item_seen: true,
          xp: 0,
          variants: [],
          favorite: false
        },
        quantity: 1
      };
    });
  }

  items['loadout_sandbox'] = {
    templateId: 'CosmeticLocker:cosmeticlocker_athena',
    attributes: {
      locker_slots_data: {
        slots: {
          Character: {
            items: [user.equipped.skin || 'CID_001_Athena_Commando_F_Default']
          },
          Backpack: {
            items: [user.equipped.backbling || '']
          },
          Pickaxe: {
            items: [user.equipped.pickaxe || 'DefaultPickaxe']
          },
          Glider: {
            items: [user.equipped.glider || 'DefaultGlider']
          },
          SkyDiveContrail: {
            items: [user.equipped.contrail || '']
          },
          LoadingScreen: {
            items: [user.equipped.loadingScreen || '']
          },
          MusicPack: {
            items: ['']
          },
          Dance: {
            items: ['', '', '', '', '', '']
          },
          ItemWrap: {
            items: ['', '', '', '', '', '', '']
          }
        }
      },
      use_count: 0,
      banner_icon_template: '',
      banner_color_template: '',
      locker_name: 'Loadout 1',
      item_seen: true
    },
    quantity: 1
  };

  return items;
}

function generateCommonCoreItems(user) {
  const items = {};

  items['Currency:MtxPurchased'] = {
    templateId: 'Currency:MtxPurchased',
    attributes: {
      platform: 'EpicPC'
    },
    quantity: user.vbucks || 0
  };

  return items;
}

router.post('/client/QueryProfile', authenticateToken, async (req, res) => {
  try {
    const { profileId, rvn } = req.query;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = createProfile(profileId || 'athena', user);
    res.json(profile);
  } catch (error) {
    console.error('QueryProfile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client/ClientQuestLogin', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      profileRevision: 1,
      profileId: 'athena',
      profileChangesBaseRevision: 1,
      profileChanges: [],
      profileCommandRevision: 1,
      serverTime: new Date().toISOString(),
      responseVersion: 1
    });
  } catch (error) {
    console.error('ClientQuestLogin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client/SetCosmeticLockerSlot', authenticateToken, async (req, res) => {
  try {
    const { category, itemToSlot, slotIndex } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const categoryMap = {
      'Character': 'skin',
      'Backpack': 'backbling',
      'Pickaxe': 'pickaxe',
      'Glider': 'glider',
      'SkyDiveContrail': 'contrail',
      'LoadingScreen': 'loadingScreen'
    };

    if (categoryMap[category]) {
      user.equipped[categoryMap[category]] = itemToSlot || '';
      await user.save();
    }

    res.json({
      profileRevision: 2,
      profileId: 'athena',
      profileChangesBaseRevision: 1,
      profileChanges: [{
        changeType: 'itemAttrChanged',
        itemId: 'loadout_sandbox',
        attributeName: 'locker_slots_data'
      }],
      profileCommandRevision: 2,
      serverTime: new Date().toISOString(),
      responseVersion: 1
    });
  } catch (error) {
    console.error('SetCosmeticLockerSlot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client/EquipBattleRoyaleCustomization', authenticateToken, async (req, res) => {
  try {
    const { slotName, itemToSlot } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const slotMap = {
      'Character': 'skin',
      'Backpack': 'backbling',
      'Pickaxe': 'pickaxe',
      'Glider': 'glider',
      'SkyDiveContrail': 'contrail',
      'LoadingScreen': 'loadingScreen'
    };

    if (slotMap[slotName]) {
      user.equipped[slotMap[slotName]] = itemToSlot || '';
      await user.save();
    }

    res.json({
      profileRevision: 2,
      profileId: 'athena',
      profileChangesBaseRevision: 1,
      profileChanges: [{
        changeType: 'statModified',
        name: `favorite_${slotName.toLowerCase()}`,
        value: itemToSlot
      }],
      profileCommandRevision: 2,
      serverTime: new Date().toISOString(),
      responseVersion: 1
    });
  } catch (error) {
    console.error('EquipBattleRoyaleCustomization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client/SetItemFavoriteStatusBatch', authenticateToken, async (req, res) => {
  try {
    res.json({
      profileRevision: 1,
      profileId: 'athena',
      profileChangesBaseRevision: 1,
      profileChanges: [],
      profileCommandRevision: 1,
      serverTime: new Date().toISOString(),
      responseVersion: 1
    });
  } catch (error) {
    console.error('SetItemFavoriteStatusBatch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/client/MarkItemSeen', authenticateToken, async (req, res) => {
  try {
    res.json({
      profileRevision: 1,
      profileId: 'athena',
      profileChangesBaseRevision: 1,
      profileChanges: [],
      profileCommandRevision: 1,
      serverTime: new Date().toISOString(),
      responseVersion: 1
    });
  } catch (error) {
    console.error('MarkItemSeen error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
