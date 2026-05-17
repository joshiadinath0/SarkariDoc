import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    // TODO: Replace with your actual purchased domain (e.g., https://sarkaridoc.in)
    const baseUrl = 'https://sarkaridoc.com'

    return [
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/hi`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        // You can add more specific tool pages here in the future as you expand it
    ]
}
