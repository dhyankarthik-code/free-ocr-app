import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Hardcoded fallbacks for Hostinger reliability
  const fallbackClientId = "390623147349-v025fheeggrghrcm1cof08aul7qv4l37.apps.googleusercontent.com";
  const fallbackRedirectUri = "https://www.ocr-extraction.com/api/auth/callback/google";

  const envUrl = process.env.NEXTAUTH_URL;
  const isInvalidEnv = !envUrl || envUrl.includes("0.0.0.0") || envUrl.includes("127.0.0.1") || envUrl.includes("localhost");

  const baseUrl = isInvalidEnv ? fallbackRedirectUri.replace('/api/auth/callback/google', '') : envUrl;
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  const clientId = process.env.GOOGLE_CLIENT_ID || fallbackClientId;

  // Log for debugging (server-side only)
  console.log(`[Auth] Using Client ID: ${clientId.substring(0, 10)}... (Env: ${!!process.env.GOOGLE_CLIENT_ID}, Fallback: ${!process.env.GOOGLE_CLIENT_ID})`);
  console.log(`[Auth] Using Base URL: ${baseUrl}`);

  // Build Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleAuthUrl.searchParams.append("client_id", clientId)
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
  googleAuthUrl.searchParams.append("response_type", "code")
  googleAuthUrl.searchParams.append("scope", "openid profile email")
  googleAuthUrl.searchParams.append("access_type", "offline")

  return NextResponse.redirect(googleAuthUrl.toString())
}
