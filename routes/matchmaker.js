const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Party = require('../models/Party');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const config = require('../config.json');

router.post('/queue', authenticateToken, async (req, res) => {
  try {
    const { playlist } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const party = await Party.findOne({ 'members.accountId': user.accountId });

    let players = [];
    if (party) {
      players = party.members.map(m => ({
        accountId: m.accountId,
        displayName: m.displayName
      }));
    } else {
      players = [{
        accountId: user.accountId,
        displayName: user.displayName
      }];
    }

    let match = await Match.findOne({
      playlist: playlist || 'Playlist_DefaultSolo',
      status: 'waiting',
      'players': { $size: { $lt: config.matchmaker.maxPlayersPerMatch } }
    });

    if (!match) {
      const matchId = uuidv4().replace(/-/g, '');
      match = new Match({
        matchId,
        playlist: playlist || 'Playlist_DefaultSolo',
        players: players,
        status: 'waiting'
      });
    } else {
      match.players.push(...players);
    }

    if (match.players.length >= config.matchmaker.minPlayersToStart) {
      match.status = 'starting';
      match.startedAt = new Date();
    }

    await match.save();

    if (party) {
      party.inMatch = true;
      await party.save();
    }

    res.json({
      message: 'Queued for match',
      matchId: match.matchId,
      playlist: match.playlist,
      status: match.status,
      playerCount: match.players.length
    });
  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await Match.findOne({
      'players.accountId': user.accountId,
      status: { $in: ['waiting', 'starting'] }
    });

    if (!match) {
      return res.status(404).json({ error: 'Not in queue' });
    }

    match.players = match.players.filter(p => p.accountId !== user.accountId);

    if (match.players.length === 0) {
      await Match.deleteOne({ matchId: match.matchId });
    } else {
      await match.save();
    }

    const party = await Party.findOne({ 'members.accountId': user.accountId });
    if (party) {
      party.inMatch = false;
      await party.save();
    }

    res.json({
      message: 'Cancelled queue'
    });
  } catch (error) {
    console.error('Cancel queue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/match/end', authenticateToken, async (req, res) => {
  try {
    const { matchId, results } = req.body;
    const match = await Match.findOne({ matchId });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.status = 'completed';
    match.endedAt = new Date();

    for (const result of results) {
      const player = match.players.find(p => p.accountId === result.accountId);
      if (player) {
        player.kills = result.kills || 0;
        player.placement = result.placement || 0;
        player.damage = result.damage || 0;
      }

      const user = await User.findOne({ accountId: result.accountId });
      if (user) {
        user.stats.kills += result.kills || 0;
        user.stats.matches += 1;

        if (result.placement === 1) {
          user.stats.wins += 1;
          user.vbucks += config.gameplay.vbucksPerWin;
        }

        if (result.placement <= 10) {
          user.stats.top10 += 1;
          user.vbucks += config.gameplay.vbucksPerTop10;
        } else if (result.placement <= 25) {
          user.stats.top25 += 1;
          user.vbucks += config.gameplay.vbucksPerTop25;
        }

        user.vbucks += (result.kills || 0) * config.gameplay.vbucksPerKill;

        await user.save();
      }
    }

    await match.save();

    res.json({
      message: 'Match ended',
      matchId: match.matchId
    });
  } catch (error) {
    console.error('End match error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const match = await Match.findOne({
      'players.accountId': user.accountId,
      status: { $in: ['waiting', 'starting', 'active'] }
    });

    if (!match) {
      return res.json({
        inQueue: false
      });
    }

    res.json({
      inQueue: true,
      matchId: match.matchId,
      status: match.status,
      playerCount: match.players.length,
      playlist: match.playlist
    });
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
