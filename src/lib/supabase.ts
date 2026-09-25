import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Hardcoded fallback credentials to guarantee connection across all devices and builds
const fallbackUrl = 'https://cgonpvpjvdqeycdbdyrh.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb25wdnBqdmRxZXljZGJkeXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3OTU5OCwiZXhwIjoyMTAzODU1NTk4fQ.mxWXJmymDovThgCWYGLWaUxUrhufNhQJYZsKnHDHrmo';

const supabaseUrl = envUrl && envUrl.startsWith('http') ? envUrl : fallbackUrl;
const supabaseAnonKey = envKey && envKey.length > 20 ? envKey : fallbackKey;

// Create a robust mock client to avoid blank page crashes if environment variables are missing/invalid
const createMockSupabaseClient = () => {
  console.warn('Using fallback mock Supabase client. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly.');
  
  const mockQueryBuilder = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    upsert: () => Promise.resolve({ data: [], error: null }),
    eq: () => Promise.resolve({ data: [], error: null }),
    limit: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  };

  const mockClient = {
    from: () => mockQueryBuilder,
    channel: () => ({
      on: () => ({
        subscribe: () => ({})
      })
    }),
    removeChannel: () => Promise.resolve(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  };

  return mockClient as any;
};

let clientInstance: any;

if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
  console.warn('Supabase environment variables are missing or invalid.');
  clientInstance = createMockSupabaseClient();
} else {
  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    clientInstance = createMockSupabaseClient();
  }
}

export const supabase = clientInstance;

