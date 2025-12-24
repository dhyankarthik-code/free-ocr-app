import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Get IP address from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';

        // Get user agent
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Fetch geolocation from IP (using free ip-api.com)
        let country = null;
        let city = null;
        let region = null;
        let timezone = null;

        if (ipAddress && ipAddress !== 'unknown' && ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
            try {
                const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city,timezone`);
                if (geoResponse.ok) {
                    const geoData = await geoResponse.json();
                    if (geoData.status === 'success') {
                        country = geoData.country;
                        city = geoData.city;
                        region = geoData.regionName;
                        timezone = geoData.timezone;
                    }
                }
            } catch (geoError) {
                console.error('Geolocation fetch failed:', geoError);
            }
        }

        // Store visitor data
        const visitor = await prisma.visitor.create({
            data: {
                email,
                ipAddress,
                country,
                city,
                region,
                timezone,
                userAgent,
            },
        });

        return NextResponse.json({ success: true, visitorId: visitor.id });
    } catch (error) {
        console.error('Visitor API error:', error);
        return NextResponse.json({ error: 'Failed to save visitor data' }, { status: 500 });
    }
}
