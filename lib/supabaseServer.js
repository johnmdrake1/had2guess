import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Use this in route handlers (our /api/* files)
export const supabaseServer = async() => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // In Next route handlers cookies are mutable; try/catch keeps it harmless in other contexts.
        set(name, value, options) {
          try { cookieStore.set(name, value, options); } catch {}
        },
        remove(name, options) {
          try { cookieStore.set(name, "", { ...options, maxAge: 0 }); } catch {}
        },
      },
    }
  );
};

// Service-role client (server only) for secure DB writes/reads
export const supabaseService = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
