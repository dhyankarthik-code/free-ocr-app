/**
 * Geolocation utility using ip-api.com (free, no API key required)
 * Rate limit: 45 requests/minute
 */

export interface GeoLocation {
    country: string | null
    city: string | null
    region: string | null
    timezone: string | null
    ip: string | null
}

/**
 * Get location data from IP address using ip-api.com
 */
export async function getLocationFromIp(ip: string): Promise<GeoLocation> {
    const defaultResult: GeoLocation = {
        country: null,
        city: null,
        region: null,
        timezone: null, // Default to null (will fallback to UTC)
        ip: ip || null
    }

    // Skip for localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return defaultResult
    }

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName,timezone`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error('[Geolocation] API request failed:', response.status)
            return defaultResult
        }

        const data = await response.json()

        if (data.status === 'success') {
            return {
                country: data.country || null,
                city: data.city || null,
                region: data.regionName || null,
                timezone: data.timezone || null,
                ip: ip
            }
        }

        return defaultResult
    } catch (error) {
        console.error('[Geolocation] Error fetching location:', error)
        return defaultResult
    }
}

/**
 * Extract client IP from request headers (handles proxies like Vercel)
 */
export function getClientIp(request: Request): string | null {
    // Vercel/Cloudflare forwards the real IP in these headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        // x-forwarded-for can contain multiple IPs, first is the client
        return forwardedFor.split(',')[0].trim()
    }

    // Vercel specific header
    const vercelIp = request.headers.get('x-real-ip')
    if (vercelIp) {
        return vercelIp
    }

    // Cloudflare header
    const cfIp = request.headers.get('cf-connecting-ip')
    if (cfIp) {
        return cfIp
    }

    return null
}
