"use client";
export function LogoutButton() { async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); } return <button onClick={logout} className="w-full border border-white/20 px-3 py-2 text-left text-sm font-semibold text-white/85 transition hover:bg-white/10">Logout</button>; }

