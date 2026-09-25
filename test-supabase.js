import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgonpvpjvdqeycdbdyrh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb25wdnBqdmRxZXljZGJkeXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3OTU5OCwiZXhwIjoyMTAzODU1NTk4fQ.mxWXJmymDovThgCWYGLWaUxUrhufNhQJYZsKnHDHrmo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('reviews').insert([{
    id: Date.now(),
    productId: 0,
    userName: "Test User",
    rating: 5,
    comment: "Test comment",
  }]);
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
