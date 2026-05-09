const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { authenticateToken } = require('../../middleware/auth');

router.get('/api/public/friends/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId });

    if (!user) {
      return res.json([]);
    }

    const acceptedFriends = user.friends.filter(f => f.status === 'accepted');
    const friendsList = [];

    for (const friend of acceptedFriends) {
      const friendUser = await User.findOne({ accountId: friend.accountId });
      if (friendUser) {
        friendsList.push({
          accountId: friend.accountId,
          status: 'ACCEPTED',
          direction: 'OUTBOUND',
          created: friend.createdAt,
          favorite: false
        });
      }
    }

    res.json(friendsList);
  } catch (error) {
    console.error('Friends list error:', error);
    res.json([]);
  }
});

router.get('/api/v1/:accountId/summary', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId });

    if (!user) {
      return res.json({
        friends: [],
        incoming: [],
        outgoing: [],
        suggested: [],
        blocklist: [],
        settings: {
          acceptInvites: 'public'
        },
        limitsReached: {
          incoming: false,
          outgoing: false,
          accepted: false
        }
      });
    }

    const acceptedFriends = user.friends.filter(f => f.status === 'accepted');
    const pendingFriends = user.friends.filter(f => f.status === 'pending');

    const friends = [];
    for (const friend of acceptedFriends) {
      const friendUser = await User.findOne({ accountId: friend.accountId });
      if (friendUser) {
        friends.push({
          accountId: friend.accountId,
          displayName: friendUser.displayName,
          status: 'ACCEPTED',
          direction: 'OUTBOUND',
          created: friend.createdAt,
          favorite: false
        });
      }
    }

    const incoming = [];
    for (const friend of pendingFriends) {
      const friendUser = await User.findOne({ accountId: friend.accountId });
      if (friendUser) {
        incoming.push({
          accountId: friend.accountId,
          displayName: friendUser.displayName,
          status: 'PENDING',
          direction: 'INBOUND',
          created: friend.createdAt,
          favorite: false
        });
      }
    }

    res.json({
      friends,
      incoming,
      outgoing: [],
      suggested: [],
      blocklist: [],
      settings: {
        acceptInvites: 'public'
      },
      limitsReached: {
        incoming: false,
        outgoing: false,
        accepted: false
      }
    });
  } catch (error) {
    console.error('Friends summary error:', error);
    res.json({
      friends: [],
      incoming: [],
      outgoing: [],
      suggested: [],
      blocklist: [],
      settings: {
        acceptInvites: 'public'
      },
      limitsReached: {
        incoming: false,
        outgoing: false,
        accepted: false
      }
    });
  }
});

router.post('/api/v1/:accountId/friends/:friendId', authenticateToken, async (req, res) => {
  try {
    const { accountId, friendId } = req.params;
    const user = await User.findOne({ accountId });
    const friend = await User.findOne({ accountId: friendId });

    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingFriend = user.friends.find(f => f.accountId === friendId);
    if (!existingFriend) {
      user.friends.push({
        accountId: friendId,
        status: 'accepted'
      });
    } else {
      existingFriend.status = 'accepted';
    }

    const existingFriendReverse = friend.friends.find(f => f.accountId === accountId);
    if (!existingFriendReverse) {
      friend.friends.push({
        accountId: accountId,
        status: 'accepted'
      });
    } else {
      existingFriendReverse.status = 'accepted';
    }

    await user.save();
    await friend.save();

    res.status(204).end();
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/api/v1/:accountId/friends/:friendId', authenticateToken, async (req, res) => {
  try {
    const { accountId, friendId } = req.params;
    const user = await User.findOne({ accountId });
    const friend = await User.findOne({ accountId: friendId });

    if (user) {
      user.friends = user.friends.filter(f => f.accountId !== friendId);
      await user.save();
    }

    if (friend) {
      friend.friends = friend.friends.filter(f => f.accountId !== accountId);
      await friend.save();
    }

    res.status(204).end();
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/public/blocklist/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId });

    if (!user) {
      return res.json([]);
    }

    const blockedFriends = user.friends.filter(f => f.status === 'blocked');
    res.json(blockedFriends.map(f => ({
      accountId: f.accountId
    })));
  } catch (error) {
    console.error('Blocklist error:', error);
    res.json([]);
  }
});

router.get('/api/v1/:accountId/settings', authenticateToken, async (req, res) => {
  try {
    res.json({
      acceptInvites: 'public'
    });
  } catch (error) {
    console.error('Friend settings error:', error);
    res.json({
      acceptInvites: 'public'
    });
  }
});

module.exports = router;
