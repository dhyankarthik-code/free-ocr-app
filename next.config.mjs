/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build-time env injection - bypasses Hostinger's runtime env limitation
  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // CSP - Relaxed for Google Analytics/GTM/Vercel/DoubleClick
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: GTM, GA, reCAPTCHA, Vercel
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://va.vercel-scripts.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              // Styles
              "style-src 'self' 'unsafe-inline'",
              // Images: All Google domains including DoubleClick for GA4
              "img-src 'self' blob: data: https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://*.google.com https://*.google.co.in https://*.doubleclick.net https://lh3.googleusercontent.com https://ui-avatars.com",
              // Fonts
              "font-src 'self' data:",
              // Connect: Critical - includes stats.g.doubleclick.net and analytics endpoints
              "connect-src 'self' https://www.googletagmanager.com https://*.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net https://*.doubleclick.net https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              // Frames: reCAPTCHA
              "frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/"
            ].join('; ')
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      // Add your 301 redirects here after checking Google Search Console
      // Example format:
      // {
      //   source: '/old-blog-post-url',
      //   destination: '/blog/new-blog-post-url',
      //   permanent: true, // 301 redirect
      // },

      // Common old WordPress patterns (if applicable)
      // {
      //   source: '/blog/:year/:month/:day/:slug',
      //   destination: '/blog/:slug',
      //   permanent: true,
      // },
    ]
  },
}

export default nextConfig
