"use client";

import { getBrowserClient } from "@/lib/supabase";

/** fetch لأي رابط أدمن — بيضيف توكن الجلسة تلقائياً */
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const supabase = getBrowserClient();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const token = session?.access_token;
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function adminLogout(): Promise<void> {
  const supabase = getBrowserClient();
  if (supabase) await supabase.auth.signOut();
}
