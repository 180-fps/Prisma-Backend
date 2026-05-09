const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/list', async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      status: { $in: ['upcoming', 'active'] }
    }).sort({ startTime: 1 });

    res.json({
      tournaments: tournaments.map(t => ({
        tournamentId: t.tournamentId,
        name: t.name,
        description: t.description,
        startTime: t.startTime,
        endTime: t.endTime,
        status: t.status,
        participants: t.participants.length,
        maxPlayers: t.maxPlayers
      }))
    });
  } catch (error) {
    console.error('Tournament list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const tournament = await Tournament.findOne({ tournamentId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament registration closed' });
    }

    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const alreadyRegistered = tournament.participants.find(p => p.accountId === user.accountId);
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Already registered' });
    }

    tournament.participants.push({
      accountId: user.accountId,
      displayName: user.displayName,
      points: 0,
      kills: 0,
      wins: 0,
      matches: 0
    });

    await tournament.save();

    res.json({
      message: 'Registered for tournament',
      tournament: {
        tournamentId: tournament.tournamentId,
        name: tournament.name,
        startTime: tournament.startTime
      }
    });
  } catch (error) {
    console.error('Tournament registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tournamentId/leaderboard', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findOne({ tournamentId });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const leaderboard = tournament.participants
      .sort((a, b) => b.points - a.points)
      .map((p, index) => ({
        rank: index + 1,
        accountId: p.accountId,
        displayName: p.displayName,
        points: p.points,
        kills: p.kills,
        wins: p.wins,
        matches: p.matches
      }));

    res.json({
      tournamentId: tournament.tournamentId,
      name: tournament.name,
      status: tournament.status,
      leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/submit-result', authenticateToken, async (req, res) => {
  try {
    const { tournamentId, kills, placement } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const tournament = await Tournament.findOne({ tournamentId });

    if (!user || !tournament) {
      return res.status(404).json({ error: 'User or tournament not found' });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({ error: 'Tournament not active' });
    }

    const participant = tournament.participants.find(p => p.accountId === user.accountId);
    if (!participant) {
      return res.status(400).json({ error: 'Not registered for this tournament' });
    }

    if (participant.matches >= tournament.rules.maxMatches) {
      return res.status(400).json({ error: 'Maximum matches reached' });
    }

    let points = 0;
    points += kills * tournament.rules.pointsPerKill;

    if (placement === 1) {
      points += tournament.rules.pointsPerWin;
      participant.wins += 1;
    } else if (placement <= 10) {
      points += tournament.rules.pointsPerTop10;
    } else if (placement <= 25) {
      points += tournament.rules.pointsPerTop25;
    }

    participant.points += points;
    participant.kills += kills;
    participant.matches += 1;

    await tournament.save();

    res.json({
      message: 'Result submitted',
      pointsEarned: points,
      totalPoints: participant.points,
      matchesRemaining: tournament.rules.maxMatches - participant.matches
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
