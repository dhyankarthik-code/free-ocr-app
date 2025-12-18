import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''

    // Check if the hostname is the default Vercel production domain
    // We strictly target the known production alias to avoid breaking Previews (which also end in vercel.app)
    // Your team can still access Previews, but the main "free-ocr-app.vercel.app" will redirect to the .com
    const isVercelProd = hostname === 'free-ocr-app.vercel.app' || hostname === 'freeocnpp.vercelapp'

    if (
        process.env.NODE_ENV === 'production' &&
        isVercelProd
    ) {
        const url = request.nextUrl.clone()
        url.hostname = 'www.ocr-extraction.com'
        url.protocol = 'https'
        url.port = ''

        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
