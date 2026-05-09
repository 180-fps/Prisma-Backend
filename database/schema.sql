-- Prisma Backend Database Schema for PostgreSQL

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    account_id VARCHAR(32) PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    discord_id VARCHAR(255),
    vbucks INTEGER DEFAULT 1000,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    
    -- Stats
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    matches INTEGER DEFAULT 0,
    top10 INTEGER DEFAULT 0,
    top25 INTEGER DEFAULT 0,
    
    -- Arena
    arena_points INTEGER DEFAULT 0,
    arena_division VARCHAR(50) DEFAULT 'Open League',
    arena_matches INTEGER DEFAULT 0,
    
    -- Equipped Items
    equipped_skin VARCHAR(255) DEFAULT 'CID_001_Athena_Commando_F_Default',
    equipped_backbling VARCHAR(255) DEFAULT '',
    equipped_pickaxe VARCHAR(255) DEFAULT 'DefaultPickaxe',
    equipped_glider VARCHAR(255) DEFAULT 'DefaultGlider',
    equipped_contrail VARCHAR(255) DEFAULT '',
    equipped_loading_screen VARCHAR(255) DEFAULT '',
    equipped_banner VARCHAR(255) DEFAULT '',
    
    -- Account Status
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Season Stats
    season_number INTEGER DEFAULT 5,
    season_chapter INTEGER DEFAULT 2,
    season_reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(32) REFERENCES users(account_id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, item_id)
);

-- Friends Table
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    account_id VARCHAR(32) REFERENCES users(account_id) ON DELETE CASCADE,
    friend_account_id VARCHAR(32) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, friend_account_id)
);

-- Shops Table
CREATE TABLE IF NOT EXISTS shops (
    rotation_id VARCHAR(32) PRIMARY KEY,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- Shop Items Table
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    rotation_id VARCHAR(32) REFERENCES shops(rotation_id) ON DELETE CASCADE,
    item_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) DEFAULT 'common',
    price INTEGER NOT NULL,
    section VARCHAR(20) NOT NULL,
    available BOOLEAN DEFAULT TRUE
);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    tournament_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_players INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'upcoming',
    points_per_kill INTEGER DEFAULT 20,
    points_per_win INTEGER DEFAULT 100,
    points_per_top10 INTEGER DEFAULT 60,
    points_per_top25 INTEGER DEFAULT 30,
    max_matches INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Participants Table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id VARCHAR(32) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    account_id VARCHAR(32) REFERENCES users(account_id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    matches INTEGER DEFAULT 0,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, account_id)
);

-- Matches Table
CREATE TABLE IF NOT EXISTS matches (
    match_id VARCHAR(32) PRIMARY KEY,
    playlist VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Match Players Table
CREATE TABLE IF NOT EXISTS match_players (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(32) REFERENCES matches(match_id) ON DELETE CASCADE,
    account_id VARCHAR(32) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    kills INTEGER DEFAULT 0,
    placement INTEGER DEFAULT 0,
    damage INTEGER DEFAULT 0,
    survived INTEGER DEFAULT 0
);

-- Parties Table
CREATE TABLE IF NOT EXISTS parties (
    party_id VARCHAR(32) PRIMARY KEY,
    leader_id VARCHAR(32) NOT NULL,
    max_members INTEGER DEFAULT 4,
    privacy VARCHAR(20) DEFAULT 'public',
    playlist VARCHAR(100) DEFAULT 'Playlist_DefaultSolo',
    in_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Party Members Table
CREATE TABLE IF NOT EXISTS party_members (
    id SERIAL PRIMARY KEY,
    party_id VARCHAR(32) REFERENCES parties(party_id) ON DELETE CASCADE,
    account_id VARCHAR(32) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    ready BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(32) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    active BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SAC Codes Table
CREATE TABLE IF NOT EXISTS sac_codes (
    code VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(32) REFERENCES users(account_id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    uses INTEGER DEFAULT 0,
    earnings INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_inventory_account ON inventory(account_id);
CREATE INDEX IF NOT EXISTS idx_friends_account ON friends(account_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(active);
CREATE INDEX IF NOT EXISTS idx_shop_items_rotation ON shop_items(rotation_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_parties_leader ON parties(leader_id);
CREATE INDEX IF NOT EXISTS idx_party_members_party ON party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(active);
