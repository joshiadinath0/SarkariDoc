import { MetadataRoute } from 'next'
import { examTools } from '@/lib/exam-data'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://sarkaridoc.com'
    const locales = ['en', 'hi']

    const routes = [
        { path: '', priority: 1, changeFrequency: 'daily' as const },
        ...examTools.map(tool => ({ path: `/tools/${tool.slug}`, priority: 0.8, changeFrequency: 'weekly' as const })),
        { path: '/processing', priority: 0.1, changeFrequency: 'always' as const },
        { path: '/result', priority: 0.1, changeFrequency: 'always' as const },
    ]

    const sitemapEntries: MetadataRoute.Sitemap = []

    locales.forEach(lang => {
        routes.forEach(route => {
            sitemapEntries.push({
                url: `${baseUrl}/${lang}${route.path}`,
                lastModified: new Date(),
                changeFrequency: route.changeFrequency,
                priority: route.priority,
                alternates: {
                    languages: {
                        en: `${baseUrl}/en${route.path}`,
                        hi: `${baseUrl}/hi${route.path}`,
                    },
                },
            })
        })
    })

    return sitemapEntries
}
