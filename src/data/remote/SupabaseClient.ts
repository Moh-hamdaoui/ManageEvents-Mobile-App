import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==============================================
// CLIENT SUPABASE
// ==============================================

const supabaseUrl = 'https://xdhnfvevrxnimczysemi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaG5mdmV2cnhuaW1jenlzZW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODI0MDksImV4cCI6MjA4NTI1ODQwOX0.braoTR9m_ibNyPvqnbNV8p4J6mmmjXNCNBMXeb5OppA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});