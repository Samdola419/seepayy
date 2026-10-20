import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ujglzenehqvuazkutjqr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2x6ZW5laHF2dWF6a3V0anFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0Mjg2NDMsImV4cCI6MjEwODAwNDY0M30.Hi2BB5x86qXTDNOLHvNm0-GkESI__-_cfOrDFN37iFk';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZ2x6ZW5laHF2dWF6a3V0anFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQyODY0MywiZXhwIjoyMTA4MDA0NjQzfQ.7obwkzmsOmi8GZlVczL1RAesEyW8tvrO_s1TfIABW9Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
