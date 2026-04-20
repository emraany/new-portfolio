import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAllRecommendations() { return []; }
export async function addRecommendation(data: { tmdb_id: number; title: string; poster_path: string; note?: string }) { return null; }
