import { notFound } from "next/navigation";

import { CareerEditor } from "@/components/career-editor";
import { getDb } from "@/lib/db";
import type { CareerOpening } from "@/lib/types";
export const dynamic = "force-dynamic";
export default async function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { ObjectId } = await import("mongodb"); if (!ObjectId.isValid(id)) notFound(); const role = await (await getDb()).collection<CareerOpening>("careerOpenings").findOne({ _id: new ObjectId(id) }); if (!role) notFound(); return <><p className="text-sm font-semibold uppercase tracking-[.16em] text-bronze">Career opening</p><h1 className="mt-3 text-4xl font-semibold">Edit role</h1><CareerEditor role={role} /></>; }
