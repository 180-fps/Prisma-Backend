const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientAccountId, itemId, itemType } = req.body;
    const sender = await User.findOne({ accountId: req.user.accountId });
    const recipient = await User.findOne({ accountId: recipientAccountId });

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sender.accountId === recipient.accountId) {
      return res.status(400).json({ error: 'Cannot gift to yourself' });
    }

    const isFriend = sender.friends.find(
      f => f.accountId === recipientAccountId && f.status === 'accepted'
    );

    if (!isFriend) {
      return res.status(400).json({ error: 'Can only gift to friends' });
    }

    const inventoryKey = itemType + 's';
    if (!sender.inventory[inventoryKey]?.includes(itemId)) {
      return res.status(400).json({ error: 'Item not owned' });
    }

    if (recipient.inventory[inventoryKey]?.includes(itemId)) {
      return res.status(400).json({ error: 'Recipient already owns this item' });
    }

    sender.inventory[inventoryKey] = sender.inventory[inventoryKey].filter(i => i !== itemId);

    if (!recipient.inventory[inventoryKey]) {
      recipient.inventory[inventoryKey] = [];
    }
    recipient.inventory[inventoryKey].push(itemId);

    await sender.save();
    await recipient.save();

    res.json({
      message: 'Gift sent successfully',
      recipient: {
        accountId: recipient.accountId,
        displayName: recipient.displayName
      },
      item: {
        itemId,
        itemType
      }
    });
  } catch (error) {
    console.error('Gifting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/send-vbucks', authenticateToken, async (req, res) => {
  try {
    const { recipientAccountId, amount } = req.body;
    const sender = await User.findOne({ accountId: req.user.accountId });
    const recipient = await User.findOne({ accountId: recipientAccountId });

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (sender.accountId === recipient.accountId) {
      return res.status(400).json({ error: 'Cannot gift to yourself' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (sender.vbucks < amount) {
      return res.status(400).json({ error: 'Insufficient V-Bucks' });
    }

    const isFriend = sender.friends.find(
      f => f.accountId === recipientAccountId && f.status === 'accepted'
    );

    if (!isFriend) {
      return res.status(400).json({ error: 'Can only gift to friends' });
    }

    sender.vbucks -= amount;
    recipient.vbucks += amount;

    await sender.save();
    await recipient.save();

    res.json({
      message: 'V-Bucks sent successfully',
      amount,
      recipient: {
        accountId: recipient.accountId,
        displayName: recipient.displayName
      },
      remainingVbucks: sender.vbucks
    });
  } catch (error) {
    console.error('V-Bucks gifting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
