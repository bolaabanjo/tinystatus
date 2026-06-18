import { db } from '@/lib/db';
import { monitors } from '@/lib/schema';
import { generateSlug, sanitizeSlug } from '@/lib/slug';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { url, displayName, slug: rawSlug } = await req.json();

        if (!url || !displayName) {
            return Response.json(
                { error: 'url and displayName are required' },
                { status: 400 }
            );
        }

        let slug = rawSlug ? sanitizeSlug(rawSlug) : generateSlug();

        if (!slug) {
            slug = generateSlug();
        }

        const existing = await db.select().from(monitors).where(eq(monitors.slug, slug));
        if (existing.length > 0) {
            slug = slug + '-' + Math.random().toString(36).substring(2, 5);
        }

        const [monitor] = await db.insert(monitors).values({
            url,
            displayName,
            slug,
        }).returning();

        const host = req.headers.get('host') || 'tinystatus.bolabanjo.xyz';
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

        return Response.json({
            slug: monitor.slug,
            displayName: monitor.displayName,
            statusPageUrl: `${protocol}://${host}/${monitor.slug}`,
        });
    } catch (err) {
        console.error('Failed to create monitor:', err);
        return Response.json({ error: 'Failed to create monitor' }, { status: 500 });
    }
}
