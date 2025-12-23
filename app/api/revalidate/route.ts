import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) { // Change to POST for security
    const secret = request.nextUrl.searchParams.get('secret')

    // We'll use a simple hardcoded secret for now, or match it against an env variable
    // For your setup, let's use a secret key you can add to WordPress
    const MY_SECRET_TOKEN = process.env.REVALIDATION_TOKEN || 'ocr-extraction-secret-key-123'

    if (secret !== MY_SECRET_TOKEN) {
        return NextResponse.json({ message: 'Invalid secret token' }, { status: 401 })
    }

    try {
        console.log('Revalidating blog content...')
        // Revalidate the main blog page
        revalidatePath('/blog')

        // Revalidate all dynamic blog posts
        // Note: In Next.js App Router, revalidating the layout or parent path helps, 
        // but revalidating the specific page type covers all slugs
        revalidatePath('/blog/[slug]', 'page')

        // Also refresh the sitemap
        revalidatePath('/sitemap.xml')

        return NextResponse.json({ revalidated: true, now: Date.now() })
    } catch (err) {
        console.error('Revalidation Error:', err)
        return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
    }
}

// Allow GET requests too for easy testing in browser
export async function GET(request: NextRequest) {
    return POST(request)
}
