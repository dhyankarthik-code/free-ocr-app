import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // In production, this would use NextAuth.js or similar
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/facebook`
  const appId = process.env.FACEBOOK_APP_ID || "mock-app-id"

  // Build Facebook OAuth URL
  const facebookAuthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth")
  facebookAuthUrl.searchParams.append("client_id", appId)
  facebookAuthUrl.searchParams.append("redirect_uri", redirectUri)
  facebookAuthUrl.searchParams.append("scope", "public_profile,email")
  facebookAuthUrl.searchParams.append("response_type", "code")

  return NextResponse.redirect(facebookAuthUrl.toString())
}
