const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.get('/current', async (req, res) => {
  try {
    const currentShop = await Shop.findOne({ 
      active: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!currentShop) {
      return res.status(404).json({ error: 'No active shop rotation' });
    }

    res.json({
      rotationId: currentShop.rotationId,
      items: currentShop.items,
      expiresAt: currentShop.expiresAt
    });
  } catch (error) {
    console.error('Shop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentShop = await Shop.findOne({ 
      active: true,
      expiresAt: { $gt: new Date() }
    });

    if (!currentShop) {
      return res.status(404).json({ error: 'No active shop' });
    }

    const item = currentShop.items.find(i => i.itemId === itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found in shop' });
    }

    if (user.vbucks < item.price) {
      return res.status(400).json({ error: 'Insufficient V-Bucks' });
    }

    const inventoryKey = item.type + 's';
    if (user.inventory[inventoryKey]?.includes(itemId)) {
      return res.status(400).json({ error: 'Item already owned' });
    }

    user.vbucks -= item.price;
    
    if (!user.inventory[inventoryKey]) {
      user.inventory[inventoryKey] = [];
    }
    user.inventory[inventoryKey].push(itemId);

    await user.save();

    res.json({
      message: 'Purchase successful',
      item: item,
      remainingVbucks: user.vbucks
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
