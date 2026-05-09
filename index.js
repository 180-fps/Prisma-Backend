require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./database/connection');
const config = require('./config.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[Prisma] PostgreSQL connection error:', err);
  } else {
    console.log('[Prisma] Connected to PostgreSQL');
  }
});

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const shopRoutes = require('./routes/shop');
const vbucksRoutes = require('./routes/vbucks');
const friendsRoutes = require('./routes/friends');
const partyRoutes = require('./routes/party');
const matchmakerRoutes = require('./routes/matchmaker');
const tournamentRoutes = require('./routes/tournament');
const arenaRoutes = require('./routes/arena');
const giftingRoutes = require('./routes/gifting');
const statsRoutes = require('./routes/stats');

const fortniteOAuthRoutes = require('./routes/fortnite/oauth');
const fortniteAccountRoutes = require('./routes/fortnite/account');
const fortniteProfileRoutes = require('./routes/fortnite/profile');
const fortniteLightswitchRoutes = require('./routes/fortnite/lightswitch');
const fortniteTimelineRoutes = require('./routes/fortnite/timeline');
const fortniteCloudstorageRoutes = require('./routes/fortnite/cloudstorage');
const fortniteContentRoutes = require('./routes/fortnite/content');
const fortniteFriendsRoutes = require('./routes/fortnite/friends');
const fortnitePresenceRoutes = require('./routes/fortnite/presence');
const fortniteVersionRoutes = require('./routes/fortnite/version');
const fortniteCalendarRoutes = require('./routes/fortnite/calendar');

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/vbucks', vbucksRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/party', partyRoutes);
app.use('/api/matchmaker', matchmakerRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/gifting', giftingRoutes);
app.use('/api/stats', statsRoutes);

app.use('/account/api/oauth', fortniteOAuthRoutes);
app.use('/account/api/public/account', fortniteAccountRoutes);
app.use('/fortnite/api/game/v2/profile/:accountId', fortniteProfileRoutes);
app.use('/lightswitch', fortniteLightswitchRoutes);
app.use('/timeline', fortniteTimelineRoutes);
app.use('/fortnite/api/cloudstorage', fortniteCloudstorageRoutes);
app.use('/content', fortniteContentRoutes);
app.use('/friends', fortniteFriendsRoutes);
app.use('/presence', fortnitePresenceRoutes);
app.use('/fortnite', fortniteVersionRoutes);
app.use('/fortnite', fortniteCalendarRoutes);

app.get('/', (req, res) => {
  res.json({
    name: config.server.name,
    version: config.server.version,
    season: config.server.season,
    chapter: config.server.chapter,
    status: 'online'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: config.server.version
  });
});

app.get('/waitingroom/api/waitingroom', (req, res) => {
  res.status(204).end();
});

app.get('/socialban/api/public/v1/*', (req, res) => {
  res.json({
    bans: [],
    warnings: []
  });
});

app.get('/fortnite/api/receipts/v1/account/:accountId/receipts', (req, res) => {
  res.json([]);
});

app.get('/fortnite/api/statsv2/account/:accountId', (req, res) => {
  res.json({
    startTime: 0,
    endTime: 0,
    stats: {},
    accountId: req.params.accountId
  });
});

app.get('/statsproxy/api/statsv2/account/:accountId', (req, res) => {
  res.json({
    startTime: 0,
    endTime: 0,
    stats: {},
    accountId: req.params.accountId
  });
});

app.post('/fortnite/api/feedback/*', (req, res) => {
  res.status(204).end();
});

app.post('/fortnite/api/statsv2/query', (req, res) => {
  res.json([]);
});

app.post('/datarouter/api/v1/public/*', (req, res) => {
  res.status(204).end();
});

app.get('/presence/api/v1/_/:accountId/settings/subscriptions', (req, res) => {
  res.json([]);
});

app.get('/eulatracking/api/public/agreements/fn/account/*', (req, res) => {
  res.status(204).end();
});

app.get('/api/v1/events/Fortnite/download/:accountId', (req, res) => {
  res.json({
    player: null,
    events: [],
    templates: []
  });
});

app.all('*', (req, res) => {
  console.log(`[Unhandled] ${req.method} ${req.url}`);
  res.status(404).json({
    errorCode: 'errors.com.epicgames.common.not_found',
    errorMessage: `Route ${req.method} ${req.url} was not found`,
    messageVars: [req.method, req.url],
    numericErrorCode: 1004,
    originatingService: 'any',
    intent: 'prod'
  });
});

const discordBot = require('./discord/bot');
const xmppServer = require('./xmpp/server');
const shopRotation = require('./services/shopRotation');
const seasonalReset = require('./services/seasonalReset');

const PORT = process.env.PORT || config.server.port || 3551;

app.listen(PORT, () => {
  console.log(`[Prisma Backend] Server running on port ${PORT}`);
  console.log(`[Prisma Backend] Version: ${config.server.version}`);
  console.log(`[Prisma Backend] Season: Chapter ${config.server.chapter} Season ${config.server.season}`);
  console.log(`[Prisma Backend] Fortnite endpoints ready`);
  
  discordBot.start();
  xmppServer.start();
  shopRotation.start();
  seasonalReset.start();
});

module.exports = app;
