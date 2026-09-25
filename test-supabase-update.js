import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgonpvpjvdqeycdbdyrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb25wdnBqdmRxZXljZGJkeXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3OTU5OCwiZXhwIjoyMTAzODU1NTk4fQ.mxWXJmymDovThgCWYGLWaUxUrhufNhQJYZsKnHDHrmo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('reviews').update({rating: 4}).eq('id', "1710000000000");
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
