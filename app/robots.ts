import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/uploads/', '/processed/', '/temp/'],
        },
        // TODO: Replace with your actual purchased domain
        sitemap: 'https://sarkaridoc.com/sitemap.xml',
    }
}
