import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/models/user-model";
import { hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const body = await request.json();
    await connectToDatabase();

    const updateData: Record<string, any> = {};

    if (typeof body.role === "string") {
      updateData.role = body.role === "admin" ? "admin" : "user";
    }

    if (typeof body.fullName === "string" && body.fullName.trim()) {
      updateData.fullName = body.fullName.trim();
    }

    if (typeof body.phone === "string") {
      updateData.phone = body.phone.trim();
    }

    if (typeof body.password === "string" && body.password.trim()) {
      if (body.password.trim().length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(body.password.trim());
    }

    updateData.updatedAt = new Date();

    const updatedUser: any = await UserModel.findByIdAndUpdate(userId, updateData, { new: true })
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: String(updatedUser._id),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        authProvider: updatedUser.authProvider
      }
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    await connectToDatabase();
    const deletedUser = await UserModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${deletedUser.email} deleted successfully.`
    });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
