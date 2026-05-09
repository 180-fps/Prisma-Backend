const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config.json');

router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      accountId: user.accountId,
      vbucks: user.vbucks
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    user.vbucks += amount;
    await user.save();

    res.json({
      message: 'V-Bucks added successfully',
      amount: amount,
      newBalance: user.vbucks,
      reason: reason || 'Manual addition'
    });
  } catch (error) {
    console.error('Add V-Bucks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reward/kill', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const vbucksReward = config.gameplay.vbucksPerKill;
    user.vbucks += vbucksReward;
    user.stats.kills += 1;
    await user.save();

    res.json({
      message: 'Kill reward granted',
      vbucksEarned: vbucksReward,
      newBalance: user.vbucks,
      totalKills: user.stats.kills
    });
  } catch (error) {
    console.error('Kill reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reward/win', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const vbucksReward = config.gameplay.vbucksPerWin;
    user.vbucks += vbucksReward;
    user.stats.wins += 1;
    await user.save();

    res.json({
      message: 'Victory Royale reward granted',
      vbucksEarned: vbucksReward,
      newBalance: user.vbucks,
      totalWins: user.stats.wins
    });
  } catch (error) {
    console.error('Win reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reward/placement', authenticateToken, async (req, res) => {
  try {
    const { placement } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let vbucksReward = 0;

    if (placement <= 10) {
      vbucksReward = config.gameplay.vbucksPerTop10;
      user.stats.top10 += 1;
    } else if (placement <= 25) {
      vbucksReward = config.gameplay.vbucksPerTop25;
      user.stats.top25 += 1;
    }

    if (vbucksReward > 0) {
      user.vbucks += vbucksReward;
      await user.save();

      res.json({
        message: `Top ${placement} reward granted`,
        vbucksEarned: vbucksReward,
        newBalance: user.vbucks
      });
    } else {
      res.json({
        message: 'No reward for this placement',
        vbucksEarned: 0,
        newBalance: user.vbucks
      });
    }
  } catch (error) {
    console.error('Placement reward error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
