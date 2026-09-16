import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getCurrentUser } from "@/lib/auth/current-user";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/models/user-model";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 403 });
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "").trim();
    const newPassword = String(body.newPassword || "").trim();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "New admin password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const dbUser = await UserModel.findById(adminUser._id);
    if (!dbUser) {
      return NextResponse.json({ error: "Admin user account not found." }, { status: 404 });
    }

    // If user has existing password, verify current password first if provided
    if (dbUser.passwordHash && currentPassword) {
      const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current admin password is incorrect." },
          { status: 400 }
        );
      }
    }

    const newPasswordHash = await hashPassword(newPassword);
    dbUser.passwordHash = newPasswordHash;
    dbUser.updatedAt = new Date();
    await dbUser.save();

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully! Please use your new password next time you sign in."
    });
  } catch (error) {
    console.error("Failed to update admin password:", error);
    return NextResponse.json(
      { error: "Internal error updating admin password." },
      { status: 500 }
    );
  }
}
