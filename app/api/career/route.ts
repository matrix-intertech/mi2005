import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { CareerOpening } from "@/lib/types";
export const runtime = "nodejs";
export async function GET() { const roles = await (await getDb()).collection<CareerOpening>("careerOpenings").find({ status: "open" }).sort({ createdAt: -1 }).toArray(); return NextResponse.json(roles); }