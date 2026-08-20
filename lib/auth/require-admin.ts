import { getCurrentUser } from "@/lib/auth/current-user";

export async function requireAdminSession() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
