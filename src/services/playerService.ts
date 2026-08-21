import { Player } from '@/types/domain';
import { PlayerInput } from '@/validation/player';
import { requireSupabaseConfig, supabase } from './supabase';
import { isSupabaseConfigured } from './env';
import {
  initSqlite,
  sqliteFetchPlayers,
  sqliteCreatePlayer,
  sqliteUpdatePlayer,
  sqliteDeletePlayer
} from './sqlite';

type PlayerRow = {
  id: string;
  owner_id: string;
  name: string;
  position: Player['position'];
  rating: number;
  is_playing: boolean;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchPlayers(ownerId: string): Promise<Player[]> {
  if (!isSupabaseConfigured) {
    await initSqlite();
    return sqliteFetchPlayers(ownerId);
  }
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function createPlayer(ownerId: string, input: PlayerInput): Promise<Player> {
  if (!isSupabaseConfigured) {
    await initSqlite();
    return sqliteCreatePlayer(ownerId, input);
  }
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('players')
    .insert(toInsert(ownerId, input))
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updatePlayer(id: string, input: PlayerInput): Promise<Player> {
  if (!isSupabaseConfigured) {
    await initSqlite();
    return sqliteUpdatePlayer(id, input);
  }
  requireSupabaseConfig();
  const { data, error } = await supabase
    .from('players')
    .update({ ...toUpdate(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deletePlayer(id: string) {
  if (!isSupabaseConfigured) {
    await initSqlite();
    await sqliteDeletePlayer(id);
    return;
  }
  requireSupabaseConfig();
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}

function toInsert(ownerId: string, input: PlayerInput) {
  return { owner_id: ownerId, ...toUpdate(input) };
}

function toUpdate(input: PlayerInput) {
  return {
    name: input.name.trim(),
    position: input.position,
    rating: input.rating,
    is_playing: input.isPlaying,
    notes: input.notes ?? null,
    photo_url: input.photoUrl ?? null
  };
}

function fromRow(row: PlayerRow): Player {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    position: row.position,
    rating: row.rating,
    isPlaying: row.is_playing,
    notes: row.notes,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
