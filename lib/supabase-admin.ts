import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.invalid',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'build-only-placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
