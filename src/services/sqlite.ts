import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { Player, Team, TeamGeneration } from '@/types/domain';

const isWeb = Platform.OS === 'web';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('volleyball.db');
  return dbPromise;
}

let initPromise: Promise<void> | null = null;

export function initSqlite(): Promise<void> {
  if (isWeb) return Promise.resolve();
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          owner_id TEXT,
          name TEXT,
          position TEXT,
          rating INTEGER,
          is_playing INTEGER,
          notes TEXT,
          photo_url TEXT,
          created_at TEXT,
          updated_at TEXT
        );
        CREATE TABLE IF NOT EXISTS team_generations (
          id TEXT PRIMARY KEY,
          owner_id TEXT,
          team_count INTEGER,
          player_count INTEGER,
          created_at TEXT,
          balance_score REAL,
          teams_json TEXT
        );
      `);
    })();
  }
  return initPromise;
}

function playerRowToPlayer(row: any): Player {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    position: row.position,
    rating: Number(row.rating),
    isPlaying: Boolean(row.is_playing),
    notes: row.notes,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  } as Player;
}

// Web fallback using localStorage (expo-sqlite has no web implementation for this API)
const PLAYERS_KEY = 'volleyball_players_v1';
const GENERATIONS_KEY = 'volleyball_generations_v1';

function loadPlayersFromStorage(): any[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePlayersToStorage(rows: any[]) {
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(rows));
  } catch {
    // ignore storage failures
  }
}

function loadGenerationsFromStorage(): any[] {
  try {
    const raw = localStorage.getItem(GENERATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGenerationsToStorage(rows: any[]) {
  try {
    localStorage.setItem(GENERATIONS_KEY, JSON.stringify(rows));
  } catch {
    // ignore storage failures
  }
}

export async function sqliteFetchPlayers(ownerId: string): Promise<Player[]> {
  if (!isWeb) {
    await initSqlite();
    const db = await getDb();
    const rows = await db.getAllAsync<any>('SELECT * FROM players WHERE owner_id = ? ORDER BY name ASC', [ownerId]);
    return rows.map(playerRowToPlayer);
  }
  const rows = loadPlayersFromStorage()
    .filter((r) => r.owner_id === ownerId)
    .sort((a, b) => a.name.localeCompare(b.name));
  return rows.map(playerRowToPlayer);
}

export async function sqliteCreatePlayer(ownerId: string, input: Partial<Player>): Promise<Player> {
  const id = input.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  if (!isWeb) {
    await initSqlite();
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO players (id, owner_id, name, position, rating, is_playing, notes, photo_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        input.name ?? 'Unnamed',
        (input.position as string) ?? 'flexible',
        Number(input.rating ?? 3),
        input.isPlaying ? 1 : 0,
        input.notes ?? null,
        input.photoUrl ?? null,
        now,
        now
      ]
    );
    const row = await db.getFirstAsync<any>('SELECT * FROM players WHERE id = ?', [id]);
    return playerRowToPlayer(row);
  }
  const rows = loadPlayersFromStorage();
  const row = {
    id,
    owner_id: ownerId,
    name: input.name ?? 'Unnamed',
    position: (input.position as string) ?? 'flexible',
    rating: Number(input.rating ?? 3),
    is_playing: input.isPlaying ? 1 : 0,
    notes: input.notes ?? null,
    photo_url: input.photoUrl ?? null,
    created_at: now,
    updated_at: now
  };
  rows.push(row);
  savePlayersToStorage(rows);
  return playerRowToPlayer(row);
}

export async function sqliteUpdatePlayer(id: string, input: Partial<Player>): Promise<Player> {
  const now = new Date().toISOString();
  if (!isWeb) {
    await initSqlite();
    const db = await getDb();
    const existing = await db.getFirstAsync<any>('SELECT * FROM players WHERE id = ?', [id]);
    if (!existing) throw new Error('Player not found');
    await db.runAsync(
      `UPDATE players SET name = ?, position = ?, rating = ?, is_playing = ?, notes = ?, photo_url = ?, updated_at = ? WHERE id = ?`,
      [
        input.name ?? existing.name,
        (input.position as string) ?? existing.position,
        Number(input.rating ?? existing.rating),
        input.isPlaying ? 1 : 0,
        input.notes ?? existing.notes,
        input.photoUrl ?? existing.photo_url,
        now,
        id
      ]
    );
    const row = await db.getFirstAsync<any>('SELECT * FROM players WHERE id = ?', [id]);
    return playerRowToPlayer(row);
  }
  const rows = loadPlayersFromStorage();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Player not found');
  rows[idx] = {
    ...rows[idx],
    name: input.name ?? rows[idx].name,
    position: (input.position as string) ?? rows[idx].position,
    rating: input.rating ?? rows[idx].rating,
    is_playing: input.isPlaying ? 1 : 0,
    notes: input.notes ?? rows[idx].notes,
    photo_url: input.photoUrl ?? rows[idx].photo_url,
    updated_at: now
  };
  savePlayersToStorage(rows);
  return playerRowToPlayer(rows[idx]);
}

export async function sqliteDeletePlayer(id: string): Promise<void> {
  if (!isWeb) {
    await initSqlite();
    const db = await getDb();
    await db.runAsync('DELETE FROM players WHERE id = ?', [id]);
    return;
  }
  const rows = loadPlayersFromStorage();
  const filtered = rows.filter((r) => r.id !== id);
  savePlayersToStorage(filtered);
}

export async function sqliteSaveTeamGeneration(
  ownerId: string,
  teamCount: number,
  balanceScore: number,
  teams: Team[]
): Promise<TeamGeneration> {
  const id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();
  const playerCount = teams.reduce((s, t) => s + t.players.length, 0);
  if (!isWeb) {
    await initSqlite();
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO team_generations (id, owner_id, team_count, player_count, created_at, balance_score, teams_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, ownerId, teamCount, playerCount, now, balanceScore, JSON.stringify(teams)]
    );
  } else {
    const rows = loadGenerationsFromStorage();
    rows.push({
      id,
      owner_id: ownerId,
      team_count: teamCount,
      player_count: playerCount,
      created_at: now,
      balance_score: balanceScore,
      teams_json: JSON.stringify(teams)
    });
    saveGenerationsToStorage(rows);
  }
  return {
    id,
    teamCount,
    playerCount,
    createdAt: now,
    balanceScore,
    teams,
    finalizedAt: now
  } as TeamGeneration;
}
