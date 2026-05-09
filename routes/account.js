const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      accountId: user.accountId,
      displayName: user.displayName,
      email: user.email,
      vbucks: user.vbucks,
      level: user.level,
      xp: user.xp,
      stats: user.stats,
      arena: user.arena,
      equipped: user.equipped,
      discordLinked: !!user.discordId,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/inventory', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      inventory: user.inventory,
      equipped: user.equipped
    });
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/equip', authenticateToken, async (req, res) => {
  try {
    const { type, itemId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validTypes = ['skin', 'backbling', 'pickaxe', 'glider', 'contrail', 'loadingScreen', 'banner'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid item type' });
    }

    const inventoryKey = type + 's';
    if (type !== 'skin' && type !== 'pickaxe' && type !== 'glider' && !user.inventory[inventoryKey]?.includes(itemId)) {
      return res.status(400).json({ error: 'Item not owned' });
    }

    user.equipped[type] = itemId;
    await user.save();

    res.json({
      message: 'Item equipped successfully',
      equipped: user.equipped
    });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      stats: user.stats,
      arena: user.arena,
      level: user.level,
      xp: user.xp
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
