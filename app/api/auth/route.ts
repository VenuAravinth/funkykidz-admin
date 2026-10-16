import { NextResponse } from "next/server";
import { handleLogin } from "./handlers/login";
import { handleRegister } from "./handlers/register";
import { handleForgotPassword } from "./handlers/forgotPassword";
import { handleMe } from "./handlers/me";
import { handleLogout } from "./handlers/logout";
import {
  handleMfaLoginSendOtp,
  handleMfaLoginVerifyOtp,
  handleMfaSetupConfirm,
  handleMfaSetupInit,
  handleMfaSetupSendOtp,
  handleMfaSetupVerifyOtp,
  handleMfaVerify,
} from "./handlers/mfa";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = (body as { action?: string } | null)?.action;

  switch (action) {
    case "login":
      return handleLogin(body);
    case "register":
      return handleRegister(body);
    case "forgotPassword":
      return handleForgotPassword(body);
    case "logout":
      return handleLogout();
    case "mfaSetupSendOtp":
      return handleMfaSetupSendOtp(body);
    case "mfaSetupVerifyOtp":
      return handleMfaSetupVerifyOtp(body);
    case "mfaSetupInit":
      return handleMfaSetupInit();
    case "mfaSetupConfirm":
      return handleMfaSetupConfirm(body);
    case "mfaVerify":
      return handleMfaVerify(body);
    case "mfaLoginSendOtp":
      return handleMfaLoginSendOtp();
    case "mfaLoginVerifyOtp":
      return handleMfaLoginVerifyOtp(body);
    default:
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action");

  switch (action) {
    case "me":
      return handleMe();
    default:
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
  }
}
