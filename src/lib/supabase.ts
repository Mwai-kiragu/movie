
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cmigqnzurekjmlonnvmz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtaWdxbnp1cmVram1sb25udm16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTAyNTcsImV4cCI6MjA3MjIyNjI1N30.L4p6FzTSkpfkrHpY0gwExwlpCqhUjB59V4Om5cidKg8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);