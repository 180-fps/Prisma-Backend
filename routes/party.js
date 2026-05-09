const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { privacy, maxMembers } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingParty = await Party.findOne({
      'members.accountId': user.accountId
    });

    if (existingParty) {
      return res.status(400).json({ error: 'Already in a party' });
    }

    const partyId = uuidv4().replace(/-/g, '');

    const party = new Party({
      partyId,
      leaderId: user.accountId,
      members: [{
        accountId: user.accountId,
        displayName: user.displayName,
        ready: true
      }],
      privacy: privacy || 'public',
      maxMembers: maxMembers || 4
    });

    await party.save();

    res.json({
      message: 'Party created',
      party: {
        partyId: party.partyId,
        leaderId: party.leaderId,
        members: party.members,
        privacy: party.privacy
      }
    });
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { partyId } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const party = await Party.findOne({ partyId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    if (party.members.length >= party.maxMembers) {
      return res.status(400).json({ error: 'Party is full' });
    }

    const alreadyInParty = party.members.find(m => m.accountId === user.accountId);
    if (alreadyInParty) {
      return res.status(400).json({ error: 'Already in this party' });
    }

    party.members.push({
      accountId: user.accountId,
      displayName: user.displayName,
      ready: false
    });

    await party.save();

    res.json({
      message: 'Joined party',
      party: {
        partyId: party.partyId,
        leaderId: party.leaderId,
        members: party.members
      }
    });
  } catch (error) {
    console.error('Join party error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/leave', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });
    const party = await Party.findOne({ 'members.accountId': user.accountId });

    if (!party) {
      return res.status(404).json({ error: 'Not in a party' });
    }

    party.members = party.members.filter(m => m.accountId !== user.accountId);

    if (party.members.length === 0) {
      await Party.deleteOne({ partyId: party.partyId });
      return res.json({ message: 'Party disbanded' });
    }

    if (party.leaderId === user.accountId) {
      party.leaderId = party.members[0].accountId;
    }

    await party.save();

    res.json({
      message: 'Left party',
      party: {
        partyId: party.partyId,
        leaderId: party.leaderId,
        members: party.members
      }
    });
  } catch (error) {
    console.error('Leave party error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/current', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ accountId: req.user.accountId });
    const party = await Party.findOne({ 'members.accountId': user.accountId });

    if (!party) {
      return res.status(404).json({ error: 'Not in a party' });
    }

    res.json({
      party: {
        partyId: party.partyId,
        leaderId: party.leaderId,
        members: party.members,
        privacy: party.privacy,
        playlist: party.playlist,
        inMatch: party.inMatch
      }
    });
  } catch (error) {
    console.error('Get party error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ready', authenticateToken, async (req, res) => {
  try {
    const { ready } = req.body;
    const user = await User.findOne({ accountId: req.user.accountId });
    const party = await Party.findOne({ 'members.accountId': user.accountId });

    if (!party) {
      return res.status(404).json({ error: 'Not in a party' });
    }

    const member = party.members.find(m => m.accountId === user.accountId);
    if (member) {
      member.ready = ready !== false;
    }

    await party.save();

    res.json({
      message: 'Ready status updated',
      ready: member.ready
    });
  } catch (error) {
    console.error('Ready status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
