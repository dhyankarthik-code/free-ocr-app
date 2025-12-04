import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // In production, this would use NextAuth.js or similar
  const redirectUri = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`
  const clientId = process.env.GOOGLE_CLIENT_ID || "mock-client-id"

  // Build Google OAuth URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  googleAuthUrl.searchParams.append("client_id", clientId)
  googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
  googleAuthUrl.searchParams.append("response_type", "code")
  googleAuthUrl.searchParams.append("scope", "openid profile email")
  googleAuthUrl.searchParams.append("access_type", "offline")

  return NextResponse.redirect(googleAuthUrl.toString())
}
