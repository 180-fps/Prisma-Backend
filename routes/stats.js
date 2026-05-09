const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.get('/player/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      accountId: user.accountId,
      displayName: user.displayName,
      level: user.level,
      stats: user.stats,
      arena: user.arena,
      seasonStats: user.seasonStats
    });
  } catch (error) {
    console.error('Player stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const { type } = req.query;

    let sortField = 'stats.wins';
    if (type === 'kills') sortField = 'stats.kills';
    if (type === 'arena') sortField = 'arena.points';

    const topPlayers = await User.find()
      .sort({ [sortField]: -1 })
      .limit(100)
      .select('accountId displayName stats arena level');

    const leaderboard = topPlayers.map((player, index) => ({
      rank: index + 1,
      accountId: player.accountId,
      displayName: player.displayName,
      level: player.level,
      wins: player.stats.wins,
      kills: player.stats.kills,
      arenaPoints: player.arena.points
    }));

    res.json({
      type: type || 'wins',
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
