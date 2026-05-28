import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Trip } from "../types";

// @supabase/supabase-js se importa dinámicamente: solo se descarga cuando el
// usuario configuró su proyecto (la mayoría arranca sin cloud).

// BYOC: el usuario provee su propio proyecto de Supabase (URL + anon key).
// Guardamos los viajes como filas { id, user_id, data jsonb, updated_at } con RLS.

export const SETUP_SQL = `-- Pegá esto en el SQL editor de tu proyecto Supabase:
create table if not exists public.trips (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.trips enable row level security;
create policy "own_trips" on public.trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;

let client: SupabaseClient | null = null;
let clientKey = "";

export async function createCloudClient(url: string, anonKey: string): Promise<SupabaseClient | null> {
  if (!url || !anonKey) return null;
  const key = `${url}::${anonKey}`;
  if (client && clientKey === key) return client;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    clientKey = key;
    return client;
  } catch {
    return null;
  }
}

export type CloudTripRow = { id: string; data: Trip; updated_at: string };

export async function signUp(c: SupabaseClient, email: string, password: string) {
  const { error } = await c.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(c: SupabaseClient, email: string, password: string) {
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut(c: SupabaseClient) {
  await c.auth.signOut();
}

export async function getSession(c: SupabaseClient): Promise<Session | null> {
  const { data } = await c.auth.getSession();
  return data.session;
}

export async function pullTrips(c: SupabaseClient): Promise<Trip[]> {
  const { data, error } = await c.from("trips").select("id,data,updated_at");
  if (error) throw error;
  return (data ?? []).map((row) => {
    const t = (row as CloudTripRow).data;
    return { ...t, updatedAt: t.updatedAt ?? (row as CloudTripRow).updated_at };
  });
}

export async function pushTrip(c: SupabaseClient, trip: Trip): Promise<void> {
  const updatedAt = trip.updatedAt ?? new Date().toISOString();
  const { error } = await c.from("trips").upsert({ id: trip.id, data: trip, updated_at: updatedAt });
  if (error) throw error;
}

export async function deleteTripCloud(c: SupabaseClient, id: string): Promise<void> {
  const { error } = await c.from("trips").delete().eq("id", id);
  if (error) throw error;
}

/** Merge last-write-wins por updatedAt. Devuelve el set unificado. */
export function mergeTrips(local: Trip[], cloud: Trip[]): Trip[] {
  const byId = new Map<string, Trip>();
  for (const t of local) byId.set(t.id, t);
  for (const t of cloud) {
    const existing = byId.get(t.id);
    if (!existing) {
      byId.set(t.id, t);
    } else {
      const a = existing.updatedAt ?? "";
      const b = t.updatedAt ?? "";
      byId.set(t.id, b > a ? t : existing);
    }
  }
  return Array.from(byId.values());
}

export function describeCloudError(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) {
    const msg = String((e as { message: unknown }).message);
    if (/Invalid login/i.test(msg)) return "Email o contraseña incorrectos.";
    if (/already registered/i.test(msg)) return "Ese email ya está registrado. Iniciá sesión.";
    if (/relation .*trips.* does not exist/i.test(msg)) return "Falta crear la tabla 'trips'. Corré el SQL de setup.";
    return msg;
  }
  return "Error de sincronización.";
}
