import { type NextRequest, NextResponse } from "next/server"

// Production URL constant
const PRODUCTION_URL = "https://www.ocr-extraction.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Use build-time injected env vars (via next.config.mjs)
  const isDev = process.env.NODE_ENV !== "production";
  const baseUrl = isDev ? "http://localhost:3000" : PRODUCTION_URL;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = `${baseUrl}/api/auth/callback/google`;

  console.log("[Auth] Callback received:", {
    code: code ? "Present" : "Missing",
    error,
    clientIdPresent: !!clientId,
    clientSecretPresent: !!clientSecret,
    nodeEnv: process.env.NODE_ENV
  });

  // Validate OAuth config
  if (!clientId || !clientSecret) {
    console.error("[Auth] Missing OAuth credentials");
    console.error("[Auth] GOOGLE_CLIENT_ID present:", !!clientId);
    console.error("[Auth] GOOGLE_CLIENT_SECRET present:", !!clientSecret);
    return NextResponse.redirect(new URL("/?error=config_error", baseUrl));
  }

  if (error) {
    console.error("[Auth] OAuth error from Google:", error);
    return NextResponse.redirect(new URL(`/?error=${error}`, baseUrl));
  }

  if (!code) {
    console.error("[Auth] No authorization code received");
    return NextResponse.redirect(new URL("/?error=no_code", baseUrl));
  }

  try {
    console.log("[Auth] Exchanging code for tokens...");
    console.log("[Auth] Using redirect_uri:", callbackUrl);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      console.error("[Auth] Status:", tokenResponse.status);
      console.error("[Auth] Token exchange failed with status:", tokenResponse.status);
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", baseUrl));
    }

    const { access_token } = await tokenResponse.json();
    console.log("[Auth] Token exchange successful");

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      console.error("[Auth] User info fetch failed:", await userResponse.text());
      return NextResponse.redirect(new URL("/?error=user_fetch_failed", baseUrl));
    }

    const googleUser = await userResponse.json();
    console.log("[Auth] User authenticated:", googleUser.email);

    // Get client IP and location
    const { getClientIp, getLocationFromIp } = await import("@/lib/geolocation");
    const clientIp = getClientIp(request);
    const location = clientIp ? await getLocationFromIp(clientIp) : null;

    // Upsert user in database (only if DATABASE_URL is configured)
    try {
      const { default: prisma } = await import("@/lib/db");

      const existingUser = await prisma.user.findUnique({
        where: { googleId: googleUser.sub }
      });

      const locationData = {
        country: location?.country || null,
        city: location?.city || null,
        region: location?.region || null,
        timezone: location?.timezone || null,
        lastLoginIp: clientIp || null,
        systemIp: clientIp || null,
        lastLoginAt: new Date()
      };

      if (!existingUser) {
        await prisma.user.create({
          data: {
            googleId: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            usageMB: 0.0,
            lastUsageDate: new Date(),
            ...locationData
          }
        });
        console.log("[Auth] Created new user:", googleUser.email, "from", location?.country || "unknown");
      } else {
        await prisma.user.update({
          where: { googleId: googleUser.sub },
          data: locationData
        });
        console.log("[Auth] Updated user location:", googleUser.email, "from", location?.country || "unknown");
      }
    } catch (dbError) {
      console.error("[Auth] Database error (non-fatal):", dbError);
      // Continue even if DB fails - session will still work
    }

    // Create session with real Google user data
    const user = {
      id: `google_${googleUser.sub}`,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      provider: "google",
    };

    // Set session cookie and redirect to home
    const response = NextResponse.redirect(new URL("/", baseUrl));
    response.cookies.set("session", JSON.stringify(user), {
      httpOnly: true,
      secure: true, // Always secure in production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("[Auth] Login successful, redirecting to:", baseUrl);
    return response;
  } catch (error) {
    console.error("[Auth] OAuth error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_error", baseUrl));
  }
}
