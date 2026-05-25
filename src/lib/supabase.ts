import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const tablePrefix = import.meta.env.VITE_TABLE_PREFIX as string | undefined;

if (!supabaseUrl || !supabaseAnonKey || !tablePrefix) {
  throw new Error('Missing Supabase environment configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const colorRunsTable = `${tablePrefix}_color_runs`;
