import { NextResponse } from "next/server";
import { z } from "zod";
import { changeRoleSchema, resetPasswordSchema, userCreateSchema, userEditSchema, userStatuses } from "@/features/users/schema";
import { ErpApiError, ErpNotConfiguredError } from "@/lib/erpApi";
import { forgetSessionChecks, getSessionUser } from "@/lib/session";
import { createUser, listUsers, setUserPassword, signOutUser, updateUser } from "@/lib/userStore";
import type { AuthUser } from "@/types/auth";

// Only administrators manage ERP accounts (the backend also refuses to remove the last one).
const ADMIN_ROLE_ID = "role_administrator";

const idSchema = z.object({ id: z.string().regex(/^[a-f0-9]{24}$/i) });
const statusSchema = z.object({ status: z.enum(userStatuses) });

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function errorResponse(err: unknown, fallback: string) {
  if (err instanceof ErpNotConfiguredError) return json({ message: err.message }, 503);
  if (err instanceof ErpApiError) return json({ message: err.message, details: err.details }, err.status);
  console.error(err);
  return json({ message: fallback }, 500);
}

async function requireAdmin(): Promise<AuthUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return json({ message: "Not authenticated." }, 401);
  if (user.roleId !== ADMIN_ROLE_ID) return json({ message: "Only administrators can manage users." }, 403);
  return user;
}

function invalid(error: z.ZodError) {
  return json({ message: "Invalid input.", fieldErrors: z.flattenError(error).fieldErrors }, 400);
}

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const action = new URL(request.url).searchParams.get("action");
  try {
    switch (action) {
      case "list":
        return json({ items: await listUsers() });
      default:
        return json({ message: "Unknown action." }, 400);
    }
  } catch (err) {
    return errorResponse(err, "Couldn't load users.");
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (admin instanceof NextResponse) return admin;

  const body = await request.json().catch(() => null);
  const action = (body as { action?: string } | null)?.action;
  const input = (body as { input?: unknown } | null)?.input;
  const id = idSchema.safeParse(body);
  if (action !== "create" && !id.success) return json({ message: "Invalid input." }, 400);
  const userId = id.data?.id ?? "";

  try {
    switch (action) {
      case "create": {
        const parsed = userCreateSchema.safeParse(input);
        if (!parsed.success) return invalid(parsed.error);
        return json({ item: await createUser(parsed.data, admin.email) }, 201);
      }
      case "update": {
        const parsed = userEditSchema.safeParse(input);
        if (!parsed.success) return invalid(parsed.error);
        return json({ item: await updateUser(userId, { ...parsed.data, staffId: parsed.data.staffId ?? "" }, admin.email) });
      }
      case "setStatus": {
        const parsed = statusSchema.safeParse(input);
        if (!parsed.success) return invalid(parsed.error);
        return json({ item: await updateUser(userId, parsed.data, admin.email) });
      }
      case "changeRole": {
        const parsed = changeRoleSchema.safeParse(input);
        if (!parsed.success) return invalid(parsed.error);
        return json({ item: await updateUser(userId, parsed.data, admin.email) });
      }
      case "resetPassword": {
        const parsed = resetPasswordSchema.safeParse(input);
        if (!parsed.success) return invalid(parsed.error);
        return json({ item: await setUserPassword(userId, parsed.data.password, admin.email) });
      }
      case "signOut":
        return json({ item: await signOutUser(userId, admin.email) });
      default:
        return json({ message: "Unknown action." }, 400);
    }
  } catch (err) {
    return errorResponse(err, "Couldn't save the user. Please try again.");
  } finally {
    // The account may have just been deactivated or signed out: stop trusting cached checks.
    if (userId) forgetSessionChecks(userId);
  }
}
