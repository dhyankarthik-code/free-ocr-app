import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  console.log("[Auth] Callback received:", { code: code ? "Present" : "Missing", error })

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }).toString(),
    })

    if (!tokenResponse.ok) {
      console.error("[v0] Token exchange failed:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
    }

    const { access_token } = await tokenResponse.json()

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userResponse.ok) {
      console.error("[v0] User info fetch failed:", await userResponse.text())
      return NextResponse.redirect(new URL("/?error=user_fetch_failed", request.url))
    }

    const googleUser = await userResponse.json()

    // Create session with real Google user data
    const user = {
      id: `google_${googleUser.sub}`,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: "google",
    }

    // Set session cookie and redirect to home
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("session", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=oauth_error", request.url))
  }
}
