import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uafebvzqklsbmsrmevbl.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZmVidnpxa2xzYm1zcm1ldmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTE4MjYsImV4cCI6MjEwMDAyNzgyNn0.XdQC58V2aOp0ZkhU7pdM-9occY-Tdc6CK-I2EkgHZZk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export { SUPABASE_URL };