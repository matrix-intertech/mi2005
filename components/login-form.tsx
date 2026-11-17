"use client";
import { useState } from "react";
export function LoginForm() {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(data: FormData) { setLoading(true); setMessage(""); const response = await fetch("/api/auth/login", { method: "POST", body: data }); if (response.ok) window.location.assign("/dashboard"); else { const result: { message?: string } = await response.json().catch(() => ({})) as { message?: string }; setMessage(result.message || "Invalid email or password."); setLoading(false); } }
  return <form action={submit} className="mt-8 space-y-5"><label className="block text-sm font-semibold">Email<input name="email" type="email" autoComplete="email" required className="mt-2 w-full border border-charcoal/55 bg-warm px-4 py-3 text-base outline-none focus:ring-2 focus:ring-bronze" /></label><label className="block text-sm font-semibold">Password<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full border border-charcoal/55 bg-warm px-4 py-3 text-base outline-none focus:ring-2 focus:ring-bronze" /></label><button disabled={loading} className="w-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button>{message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null}</form>;
}

