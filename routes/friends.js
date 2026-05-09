const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

router.get('/list', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const acceptedFriends = user.friends.filter(f => f.status === 'accepted');
    const friendDetails = await Promise.all(
      acceptedFriends.map(async (friend) => {
        const friendUser = await User.findOne({ accountId: friend.accountId });
        return {
          accountId: friend.accountId,
          displayName: friendUser?.displayName || 'Unknown',
          status: 'online',
          createdAt: friend.createdAt
        };
      })
    );

    res.json({
      friends: friendDetails
    });
  } catch (error) {
    console.error('Friends list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const pendingFriends = user.friends.filter(f => f.status === 'pending');
    const friendDetails = await Promise.all(
      pendingFriends.map(async (friend) => {
        const friendUser = await User.findOne({ accountId: friend.accountId });
        return {
          accountId: friend.accountId,
          displayName: friendUser?.displayName || 'Unknown',
          createdAt: friend.createdAt
        };
      })
    );

    res.json({
      pending: friendDetails
    });
  } catch (error) {
    console.error('Pending friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { friendAccountId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const friend = await User.findOne({ accountId: friendAccountId });

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.accountId === friend.accountId) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    const existingFriend = user.friends.find(f => f.accountId === friendAccountId);
    if (existingFriend) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }

    user.friends.push({
      accountId: friendAccountId,
      status: 'pending'
    });

    friend.friends.push({
      accountId: user.accountId,
      status: 'pending'
    });

    await user.save();
    await friend.save();

    res.json({
      message: 'Friend request sent',
      friend: {
        accountId: friend.accountId,
        displayName: friend.displayName
      }
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/accept', authenticateToken, async (req, res) => {
  try {
    const { friendAccountId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const friend = await User.findOne({ accountId: friendAccountId });

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userFriend = user.friends.find(f => f.accountId === friendAccountId);
    const friendUser = friend.friends.find(f => f.accountId === user.accountId);

    if (!userFriend || !friendUser) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    userFriend.status = 'accepted';
    friendUser.status = 'accepted';

    await user.save();
    await friend.save();

    res.json({
      message: 'Friend request accepted',
      friend: {
        accountId: friend.accountId,
        displayName: friend.displayName
      }
    });
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    const { friendAccountId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const friend = await User.findOne({ accountId: friendAccountId });

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.friends = user.friends.filter(f => f.accountId !== friendAccountId);
    friend.friends = friend.friends.filter(f => f.accountId !== user.accountId);

    await user.save();
    await friend.save();

    res.json({
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
