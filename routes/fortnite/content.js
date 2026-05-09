const express = require('express');
const router = express.Router();
const config = require('../../config.json');

router.get('/api/pages/fortnite-game', (req, res) => {
  res.json({
    _title: 'Fortnite Game',
    _activeDate: '2020-01-01T00:00:00.000Z',
    lastModified: new Date().toISOString(),
    _locale: 'en-US',
    battleroyalenews: {
      news: {
        motds: [
          {
            entryType: 'Text',
            image: 'https://i.imgur.com/AfFp7pu.png',
            tileImage: 'https://i.imgur.com/AfFp7pu.png',
            hidden: false,
            _type: 'CommonUI Simple Message MOTD',
            title: 'Prisma Backend',
            body: `Welcome to Prisma Backend!\nChapter ${config.server.chapter} Season ${config.server.season}\nVersion ${config.server.version}`,
            videoString: '',
            videoUID: '',
            videoAutoplay: false,
            videoFullscreen: false,
            spotlight: false,
            id: 'prisma-motd',
            sortingPriority: 0,
            tabTitleOverride: 'Prisma'
          }
        ]
      }
    },
    emergencynotice: {
      news: {
        platform_messages: [],
        _type: 'Battle Royale News',
        messages: []
      }
    },
    battleroyalenewsv2: {
      news: {
        motds: []
      }
    },
    loginmessage: {
      _title: 'LoginMessage',
      loginmessage: {
        _type: 'CommonUI Simple Message Base',
        title: 'Prisma Backend',
        body: `Welcome to Prisma Backend\nChapter ${config.server.chapter} Season ${config.server.season}`
      }
    },
    subgameinfo: {
      _title: 'SubGameInfo',
      battleroyale: {
        _type: 'Subgame Info',
        description: 'Battle Royale',
        subgame: 'Athena',
        standardMessageLine2: 'Prisma Backend',
        image: 'https://i.imgur.com/AfFp7pu.png',
        color: '7d7d7d'
      }
    },
    dynamicbackgrounds: {
      _title: 'DynamicBackgrounds',
      backgrounds: {
        backgrounds: [
          {
            stage: 'season5',
            _type: 'DynamicBackground',
            key: 'lobby'
          }
        ],
        _type: 'DynamicBackgroundList'
      }
    },
    shopSections: {
      _title: 'ShopSections',
      sectionList: {
        sections: [
          {
            bSortOffersByOwnership: false,
            bShowIneligibleOffers: false,
            bEnableToastNotification: true,
            background: {
              stage: 'default',
              _type: 'DynamicBackground',
              key: 'vault'
            },
            _type: 'ShopSection',
            landingPriority: 0,
            sectionId: 'Featured',
            sectionDisplayName: 'Featured',
            bShowTimer: true,
            bShowIneligibleOffersIfGiftable: false,
            bHidden: false
          },
          {
            bSortOffersByOwnership: false,
            bShowIneligibleOffers: false,
            bEnableToastNotification: true,
            background: {
              stage: 'default',
              _type: 'DynamicBackground',
              key: 'vault'
            },
            _type: 'ShopSection',
            landingPriority: 1,
            sectionId: 'Daily',
            sectionDisplayName: 'Daily',
            bShowTimer: true,
            bShowIneligibleOffersIfGiftable: false,
            bHidden: false
          }
        ]
      }
    }
  });
});

router.get('/api/pages/*', (req, res) => {
  res.json({
    _title: 'Page',
    _activeDate: '2020-01-01T00:00:00.000Z',
    lastModified: new Date().toISOString(),
    _locale: 'en-US'
  });
});

module.exports = router;
