const db = require('../database/connection');

class User {
  static async create(userData) {
    const query = `
      INSERT INTO users (
        account_id, display_name, email, password, discord_id, vbucks, level, xp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      userData.accountId,
      userData.displayName,
      userData.email,
      userData.password,
      userData.discordId || null,
      userData.vbucks || 1000,
      userData.level || 1,
      userData.xp || 0
    ];
    
    const result = await db.query(query, values);
    return this.mapRow(result.rows[0]);
  }

  static async findOne(conditions) {
    let query = 'SELECT * FROM users WHERE ';
    const values = [];
    const whereClauses = [];
    
    let paramIndex = 1;
    for (const [key, value] of Object.entries(conditions)) {
      const columnName = this.camelToSnake(key);
      whereClauses.push(`${columnName} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    query += whereClauses.join(' AND ') + ' LIMIT 1';
    
    const result = await db.query(query, values);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async find(conditions = {}) {
    let query = 'SELECT * FROM users';
    const values = [];
    
    if (Object.keys(conditions).length > 0) {
      query += ' WHERE ';
      const whereClauses = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(conditions)) {
        const columnName = this.camelToSnake(key);
        whereClauses.push(`${columnName} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      
      query += whereClauses.join(' AND ');
    }
    
    const result = await db.query(query, values);
    return result.rows.map(row => this.mapRow(row));
  }

  static async update(accountId, updates) {
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const columnName = this.camelToSnake(key);
      setClauses.push(`${columnName} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    values.push(accountId);
    
    const query = `
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE account_id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null;
  }

  static async delete(accountId) {
    const query = 'DELETE FROM users WHERE account_id = $1';
    await db.query(query, [accountId]);
  }

  static async countDocuments(conditions = {}) {
    let query = 'SELECT COUNT(*) FROM users';
    const values = [];
    
    if (Object.keys(conditions).length > 0) {
      query += ' WHERE ';
      const whereClauses = [];
      let paramIndex = 1;
      
      for (const [key, value] of Object.entries(conditions)) {
        const columnName = this.camelToSnake(key);
        whereClauses.push(`${columnName} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
      
      query += whereClauses.join(' AND ');
    }
    
    const result = await db.query(query, values);
    return parseInt(result.rows[0].count);
  }

  static async getInventory(accountId) {
    const query = 'SELECT * FROM inventory WHERE account_id = $1';
    const result = await db.query(query, [accountId]);
    
    const inventory = {
      skins: [],
      backblings: [],
      pickaxes: [],
      gliders: [],
      emotes: [],
      wraps: [],
      contrails: [],
      loadingScreens: [],
      banners: []
    };
    
    result.rows.forEach(row => {
      const key = row.item_type + 's';
      if (inventory[key]) {
        inventory[key].push(row.item_id);
      }
    });
    
    return inventory;
  }

  static async addToInventory(accountId, itemId, itemType) {
    const query = `
      INSERT INTO inventory (account_id, item_id, item_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (account_id, item_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await db.query(query, [accountId, itemId, itemType]);
    return result.rows[0];
  }

  static async removeFromInventory(accountId, itemId) {
    const query = 'DELETE FROM inventory WHERE account_id = $1 AND item_id = $2';
    await db.query(query, [accountId, itemId]);
  }

  static async getFriends(accountId) {
    const query = `
      SELECT f.*, u.display_name, u.last_login
      FROM friends f
      JOIN users u ON f.friend_account_id = u.account_id
      WHERE f.account_id = $1
    `;
    
    const result = await db.query(query, [accountId]);
    return result.rows.map(row => ({
      accountId: row.friend_account_id,
      displayName: row.display_name,
      status: row.status,
      createdAt: row.created_at
    }));
  }

  static async addFriend(accountId, friendAccountId, status = 'pending') {
    const query = `
      INSERT INTO friends (account_id, friend_account_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (account_id, friend_account_id) 
      DO UPDATE SET status = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [accountId, friendAccountId, status]);
    return result.rows[0];
  }

  static async removeFriend(accountId, friendAccountId) {
    const query = 'DELETE FROM friends WHERE account_id = $1 AND friend_account_id = $2';
    await db.query(query, [accountId, friendAccountId]);
  }

  static camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  static mapRow(row) {
    if (!row) return null;
    
    return {
      accountId: row.account_id,
      displayName: row.display_name,
      email: row.email,
      password: row.password,
      discordId: row.discord_id,
      vbucks: row.vbucks,
      level: row.level,
      xp: row.xp,
      stats: {
        kills: row.kills,
        deaths: row.deaths,
        wins: row.wins,
        matches: row.matches,
        top10: row.top10,
        top25: row.top25
      },
      arena: {
        points: row.arena_points,
        division: row.arena_division,
        matches: row.arena_matches
      },
      equipped: {
        skin: row.equipped_skin,
        backbling: row.equipped_backbling,
        pickaxe: row.equipped_pickaxe,
        glider: row.equipped_glider,
        contrail: row.equipped_contrail,
        loadingScreen: row.equipped_loading_screen,
        banner: row.equipped_banner
      },
      banned: row.banned,
      banReason: row.ban_reason,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      seasonStats: {
        season: row.season_number,
        chapter: row.season_chapter,
        resetAt: row.season_reset_at
      },
      save: async function() {
        return await User.update(this.accountId, {
          displayName: this.displayName,
          vbucks: this.vbucks,
          level: this.level,
          xp: this.xp,
          kills: this.stats.kills,
          deaths: this.stats.deaths,
          wins: this.stats.wins,
          matches: this.stats.matches,
          top10: this.stats.top10,
          top25: this.stats.top25,
          arenaPoints: this.arena.points,
          arenaDivision: this.arena.division,
          arenaMatches: this.arena.matches,
          equippedSkin: this.equipped.skin,
          equippedBackbling: this.equipped.backbling,
          equippedPickaxe: this.equipped.pickaxe,
          equippedGlider: this.equipped.glider,
          equippedContrail: this.equipped.contrail,
          equippedLoadingScreen: this.equipped.loadingScreen,
          equippedBanner: this.equipped.banner,
          banned: this.banned,
          banReason: this.banReason,
          lastLogin: this.lastLogin
        });
      }
    };
  }
}

module.exports = User;
