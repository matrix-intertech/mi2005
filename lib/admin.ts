import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/login");
}
