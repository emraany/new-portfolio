import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Recommendation {
  id?: number;
  tmdb_id: number;
  title: string;
  poster_path: string;
  note: string | null;
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Lazy singleton — avoids throwing at module load time when env vars are absent
let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const { data, error } = await getClient()
    .from('recommendations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAllRecommendations error:', error.message);
    return [];
  }

  return (data ?? []) as Recommendation[];
}

export async function addRecommendation(
  data: Omit<Recommendation, 'id' | 'created_at'>
): Promise<Recommendation> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not configured.');
  }

  const { data: inserted, error } = await getClient()
    .from('recommendations')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return inserted as Recommendation;
}
