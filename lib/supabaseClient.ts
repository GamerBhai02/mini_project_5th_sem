import { createClient } from '@supabase/supabase-js';

// The project URL from your new Edge Function.
const supabaseUrl = process.env.SUPABASE_URL || 'https://vnlljwrmkxufhmmpybqy.supabase.co';

// IMPORTANT: Your Supabase anon key is required here.
// You can find this in your Supabase project settings under the "API" section.
// It's best to set this as an environment variable (SUPABASE_ANON_KEY).
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZubGxqd3Jta3h1ZmhtbXB5YnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTA2OTUsImV4cCI6MjA3ODMyNjY5NX0.mCN8fHFAFHo9VMzz5VPfQ8-SOrSiql-GyR4VOAgTFgM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);