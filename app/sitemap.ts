import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://docfix-india.vercel.app' // Replace with actual domain when deployed

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/processing`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.1, // Process page is transient
        },
        {
            url: `${baseUrl}/result`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.1, // Result page is transient
        },
    ]
}
