import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/uploads/', '/processed/', '/temp/'],
        },
        sitemap: 'https://sarkaridocs.com/sitemap.xml',
    }
}
