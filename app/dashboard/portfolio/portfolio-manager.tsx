"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { ClientLogo } from "@/components/client-logo";
import type { PortfolioClientView } from "@/lib/portfolio-types";

const inputClass = "mt-2 w-full min-w-0 rounded-sm border border-charcoal/20 bg-white px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-bronze";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-sm bg-charcoal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";
async function request(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = await response.json().catch(() => ({})) as { message?: string; clients?: PortfolioClientView[] };
  if (!response.ok) throw new Error(data.message || "Unable to complete the request. Please try again.");
  return data;
}

export function PortfolioManager() {
  const [clients, setClients] = useState<PortfolioClientView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("public");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [editor, setEditor] = useState<PortfolioClientView | "new" | null>(null);
  const [deleting, setDeleting] = useState<PortfolioClientView | null>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const reload = useCallback(async () => {
    try { const data = await request("/api/admin/portfolio"); setClients(data.clients || []); }
    catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    let active = true;
    request("/api/admin/portfolio")
      .then(data => { if (active) setClients(data.clients || []); })
      .catch(e => { if (active) setError((e as Error).message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (deleting) deleteDialog.current?.showModal(); }, [deleting]);

  async function mutate(action: () => Promise<unknown>, success: string) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setMessage("");
    try { await action(); setMessage(success); await reload(); }
    catch (e) { setError((e as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  const visible = clients.filter(client => client.companyName.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || client.isPublic === (filter === "public")));
  return <>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Clients</p><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Portfolio Management</h1><p className="mt-3 text-charcoal/65">Manage the companies displayed across the website.</p></div>
      <button className={buttonClass} onClick={() => setEditor("new")} disabled={busy}><Plus className="h-4 w-4" />Add Client</button>
    </div>
    <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_12rem]">
      <label className="text-sm font-semibold"><span className="inline-flex items-center gap-2"><Search className="h-4 w-4" />Search company name</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} className={inputClass} placeholder="Search clients..." /></label>
      <label className="text-sm font-semibold">Display status<select aria-label="Display status" className={inputClass} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option><option value="public">Public</option><option value="hidden">Hidden</option></select></label>
    </div>
    {error && <div role="alert" className="mt-5 rounded-sm bg-red-50 p-4 text-red-800">{error}<button className="ml-3 underline" onClick={() => { setError(""); void reload(); }}>Refresh list</button></div>}
    {message && <p role="status" className="mt-5 text-emerald-800">{message}</p>}
    {loading ? <p className="mt-8" role="status">Loading clients...</p> : <>
      <p className="mt-6 text-sm text-charcoal/60">{visible.length} of {clients.length} clients</p>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {visible.map(client => <article key={client.id} className="min-w-0 border border-charcoal/10 bg-white p-5">
          <div className="flex min-w-0 items-center gap-4"><div className="flex h-24 w-28 shrink-0 items-center justify-center border border-charcoal/10 bg-warm p-3"><ClientLogo src={client.logoUrl} alt={client.logoAlt} companyName={client.companyName} /></div><div className="min-w-0"><h2 className="break-words text-xl font-semibold">{client.companyName}</h2><span className={`mt-2 inline-block px-2 py-1 text-xs font-semibold ${client.isPublic ? "bg-emerald-100 text-emerald-800" : "bg-charcoal/10 text-charcoal/70"}`}>{client.isPublic ? "Public" : "Hidden"}</span></div></div>
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm"><div><dt className="text-charcoal/60">Display order</dt><dd className="font-semibold">{client.displayOrder}</dd></div><div><dt className="text-charcoal/60">Created</dt><dd>{new Date(client.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</dd></div></dl>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className={buttonClass} disabled={busy} onClick={() => setEditor(client)} aria-label={`Edit ${client.companyName}`}><Pencil className="h-4 w-4" />Edit</button>
            <button className="px-2 py-2 text-sm font-semibold underline disabled:opacity-50" disabled={busy} onClick={() => void mutate(() => { const form = new FormData(); form.set("isPublic", String(!client.isPublic)); form.set("updatedAt", client.updatedAt); return request(`/api/admin/portfolio/${client.id}`, { method: "PATCH", body: form }); }, `${client.companyName} is now ${client.isPublic ? "Hidden" : "Public"}.`)}>{client.isPublic ? "Hide publicly" : "Make public"}</button>
            <button className="inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold text-red-700 disabled:opacity-50" disabled={busy} onClick={() => { setError(""); setDeleting(client); }} aria-label={`Delete ${client.companyName}`}><Trash2 className="h-4 w-4" />Delete</button>
          </div>
        </article>)}
      </div>
      {!visible.length && <p className="mt-4 bg-white p-6 text-charcoal/65">{clients.length ? "No clients match your search or filter." : "No clients yet. Add a client to get started."}</p>}
    </>}
    {editor && <ClientEditor client={editor === "new" ? null : editor} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); setMessage("Client saved."); await reload(); }} />}
    {deleting && <dialog ref={deleteDialog} onCancel={e => { if (busy) e.preventDefault(); else setDeleting(null); }} onClick={e => { if (e.target === e.currentTarget && !busy) setDeleting(null); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-sm bg-white p-6 text-charcoal shadow-xl backdrop:bg-black/50" aria-labelledby="delete-title">
      <h2 id="delete-title" className="text-xl font-semibold">Delete client?</h2><p className="mt-4 break-words">Remove {deleting.companyName} from the portfolio? This cannot be undone.</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3"><button className="px-4 py-2" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className="rounded-sm bg-red-700 px-4 py-2 text-white disabled:opacity-50" disabled={busy} onClick={() => void mutate(async () => { await request(`/api/admin/portfolio/${deleting.id}`, { method: "DELETE", headers: { "If-Unmodified-Since": deleting.updatedAt } }); setDeleting(null); }, "Client deleted.")}>{busy ? "Deleting..." : "Delete client"}</button></div>
    </dialog>}
  </>;
}

function ClientEditor({ client, onClose, onSaved }: { client: PortfolioClientView | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const submissionId = useRef("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(client?.logoUrl || "");
  useEffect(() => { dialog.current?.showModal(); submissionId.current = crypto.randomUUID(); }, []);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    form.set("isPublic", String(form.get("isPublic") === "on"));
    form.set("submissionId", submissionId.current);
    if (client) form.set("updatedAt", client.updatedAt);
    try { await request(client ? `/api/admin/portfolio/${client.id}` : "/api/admin/portfolio", { method: client ? "PATCH" : "POST", body: form }); await onSaved(); }
    catch (e) { setError((e as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  return <dialog ref={dialog} onCancel={e => { if (busy) e.preventDefault(); else onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-sm bg-white p-5 text-charcoal shadow-xl backdrop:bg-black/50 sm:p-8" aria-labelledby="client-editor-title">
    <h2 id="client-editor-title" className="text-2xl font-semibold">{client ? "Edit Client" : "Add Client"}</h2>
    <form onSubmit={submit} className="mt-6 space-y-5">
      <fieldset disabled={busy} className="min-w-0 space-y-5">
        <label className="block text-sm font-semibold">Company Name <span aria-hidden="true">*</span><input name="companyName" required maxLength={160} defaultValue={client?.companyName} className={inputClass} autoFocus /></label>
        <label className="block text-sm font-semibold">Company Logo {!client && <span aria-hidden="true">*</span>}<input name="logo" type="file" accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml" required={!client} className={`${inputClass} file:mr-3 file:rounded-sm file:border-0 file:bg-warm file:px-3 file:py-2`} onChange={e => {
          const file = e.target.files?.[0]; setError("");
          if (!file) { setPreview(client?.logoUrl || ""); return; }
          if (!/\.(png|jpe?g|webp|svg)$/i.test(file.name) || !["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024) {
            setError("Choose a PNG, JPG, JPEG, WebP or SVG up to 2 MB."); e.target.value = ""; setPreview(client?.logoUrl || ""); return;
          }
          setPreview(URL.createObjectURL(file));
        }} /><span className="mt-2 block text-xs font-normal text-charcoal/60">PNG, JPG, JPEG, WebP or SVG. Maximum 2 MB. {client ? "Leave unchanged to keep the existing logo." : ""}</span></label>
        {preview && <div className="flex h-28 items-center justify-center border border-charcoal/10 bg-warm p-4"><ClientLogo src={preview} alt="Logo preview" companyName={client?.companyName || "New client"} /></div>}
        <label className="flex items-center gap-3 text-sm font-semibold"><input name="isPublic" type="checkbox" role="switch" defaultChecked={client?.isPublic ?? true} className="h-5 w-5 accent-bronze" />Public Display</label>
        <label className="block text-sm font-semibold">Display Order<input name="displayOrder" type="number" min={-1000000} max={1000000} step={1} defaultValue={client?.displayOrder ?? ""} placeholder="0" className={inputClass} /><span className="mt-2 block text-xs font-normal text-charcoal/60">Lower numbers appear first. Defaults to 0.</span></label>
        <label className="block text-sm font-semibold">Logo Alt Text<input name="logoAlt" maxLength={200} defaultValue={client?.logoAlt} placeholder="Defaults to company name" className={inputClass} /></label>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap justify-end gap-3"><button type="button" className="px-4 py-2.5 text-sm font-semibold" disabled={busy} onClick={onClose}>Cancel</button><button className={buttonClass} disabled={busy}>{busy ? "Saving..." : "Save Client"}</button></div>
    </form>
  </dialog>;
}
