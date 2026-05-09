const express = require('express');
const router = express.Router();

router.get('/api/v1/timeline', (req, res) => {
  const now = new Date();
  const seasonEnd = new Date('2025-12-31T23:59:59.999Z');

  res.json({
    channels: {
      'client-matchmaking': {
        states: [],
        cacheExpire: seasonEnd.toISOString()
      },
      'client-events': {
        states: [{
          validFrom: '2020-01-01T00:00:00.000Z',
          activeEvents: [],
          state: {
            activeStorefronts: [],
            eventNamedWeights: {},
            seasonNumber: 5,
            seasonTemplateId: 'AthenaSeason:athenaseason5',
            matchXpBonusPoints: 0,
            seasonBegin: '2020-12-02T00:00:00Z',
            seasonEnd: seasonEnd.toISOString(),
            seasonDisplayedEnd: seasonEnd.toISOString(),
            weeklyStoreEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            stwEventStoreEnd: seasonEnd.toISOString(),
            stwWeeklyStoreEnd: seasonEnd.toISOString(),
            sectionStoreEnds: {
              Featured: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            dailyStoreEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }],
        cacheExpire: seasonEnd.toISOString()
      }
    },
    eventsTimeOffsetHrs: 0,
    cacheIntervalMins: 10,
    currentTime: now.toISOString()
  });
});

module.exports = router;
