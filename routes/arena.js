const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config.json');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const division = config.arena.divisions.find(d => 
      user.arena.points >= d.minPoints && user.arena.points <= d.maxPoints
    );

    res.json({
      accountId: user.accountId,
      displayName: user.displayName,
      arena: {
        points: user.arena.points,
        division: division?.name || 'Open League',
        matches: user.arena.matches
      }
    });
  } catch (error) {
    console.error('Arena profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/submit-result', authenticateToken, async (req, res) => {
  try {
    const { kills, placement } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let points = 0;
    points += kills * config.arena.pointsPerKill;

    if (placement === 1) {
      points += config.arena.pointsPerWin;
    } else if (placement <= 10) {
      points += config.arena.pointsPerTop10;
    } else if (placement <= 25) {
      points += config.arena.pointsPerTop25;
    }

    user.arena.points += points;
    user.arena.matches += 1;

    const division = config.arena.divisions.find(d => 
      user.arena.points >= d.minPoints && user.arena.points <= d.maxPoints
    );

    user.arena.division = division?.name || 'Open League';

    await user.save();

    res.json({
      message: 'Arena result submitted',
      pointsEarned: points,
      totalPoints: user.arena.points,
      division: user.arena.division
    });
  } catch (error) {
    console.error('Arena submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ 'arena.points': -1 })
      .limit(100)
      .select('accountId displayName arena');

    const leaderboard = topPlayers.map((player, index) => ({
      rank: index + 1,
      accountId: player.accountId,
      displayName: player.displayName,
      points: player.arena.points,
      division: player.arena.division,
      matches: player.arena.matches
    }));

    res.json({
      leaderboard
    });
  } catch (error) {
    console.error('Arena leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
