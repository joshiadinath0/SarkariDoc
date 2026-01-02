import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'hi']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = defaultLocale // For now, default to English. Could add header detection later.
    request.nextUrl.pathname = `/${locale}${pathname}`

    // Response with redirect
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, api, static files)
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
    ],
}
