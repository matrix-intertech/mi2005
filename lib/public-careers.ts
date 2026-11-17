import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import type { CareerOpening } from "@/lib/types";
import { isPublicCareer } from "@/lib/career-seo";

// Read only: never seed or change career records during a public request.
export const getPublicCareers = cache(async () => {
  const roles = await (await getDb()).collection<CareerOpening>("careerOpenings")
    .find({ status: "open" }).sort({ createdAt: -1 }).toArray();
  return roles.filter((role) => isPublicCareer(role));
});

export const getPublicCareer = cache(async (id: string) => {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const { ObjectId } = await import("mongodb");
  const role = await (await getDb()).collection<CareerOpening>("careerOpenings").findOne({ _id: new ObjectId(id) });
  return role && isPublicCareer(role) ? role : null;
});
