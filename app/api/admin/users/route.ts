import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/models/user-model";
import { hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";

    const filter: Record<string, any> = {};
    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } }
      ];
    }
    if (role && role !== "all") {
      filter.role = role;
    }

    const users = await UserModel.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u) => ({
      _id: String(u._id),
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role || "user",
      authProvider: u.authProvider || "local",
      province: u.province || "",
      city: u.city || "",
      district: u.district || "",
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error("Failed to list users:", error);
    return NextResponse.json({ error: "Failed to fetch users list." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "").trim();
    const role = body.role === "admin" ? "admin" : "user";

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = await UserModel.create({
      fullName,
      email,
      phone: phone || "+977-9800000000",
      passwordHash,
      role,
      authProvider: "local"
    });

    return NextResponse.json({
      success: true,
      user: {
        _id: String(newUser._id),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        authProvider: newUser.authProvider,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
  }
}
