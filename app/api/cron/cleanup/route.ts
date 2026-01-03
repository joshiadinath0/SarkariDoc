import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldFiles } from '@/lib/storage'

export async function GET(request: NextRequest) {
    try {
        // Optionally check for a secret header to prevent unauthorized cleanup triggers
        // const authHeader = request.headers.get('authorization')
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        // }

        // Purge files older than 1 hour
        await cleanupOldFiles(1)

        return NextResponse.json({
            success: true,
            appliedAt: new Date().toISOString(),
            message: 'Cleanup performed successfully'
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
