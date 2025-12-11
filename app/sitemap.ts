import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.ocr-extraction.com'

    // Define static routes
    const routes = [
        '',
        '/about',
        '/about-ocr',
        '/blog',
        '/contact',
        '/mission',
        '/privacy',
        '/terms',
        '/company-profile',
        '/faqs',
        '/resources',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }))
}
