import { db } from '@/lib/db';
import { monitors } from '@/lib/schema';
import { generateSlug, sanitizeSlug } from '@/lib/slug';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await db.query.monitors.findMany({
        where: eq(monitors.userId, userId),
        orderBy: (m, { desc }) => [desc(m.createdAt)],
    });

    return Response.json(list);
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { url, displayName, slug: rawSlug } = await req.json();

        if (!url || !displayName) {
            return Response.json({ error: 'url and displayName are required' }, { status: 400 });
        }

        let slug = rawSlug ? sanitizeSlug(rawSlug) : generateSlug();
        if (!slug) slug = generateSlug();

        const existing = await db.select().from(monitors).where(eq(monitors.slug, slug));
        if (existing.length > 0) {
            slug = slug + '-' + Math.random().toString(36).substring(2, 5);
        }

        const [monitor] = await db.insert(monitors).values({
            url,
            displayName,
            slug,
            userId,
        }).returning();

        const host = req.headers.get('host') || 'tinystatus.bolabanjo.xyz';
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';

        return Response.json({
            id: monitor.id,
            slug: monitor.slug,
            displayName: monitor.displayName,
            url: monitor.url,
            createdAt: monitor.createdAt,
            statusPageUrl: `${protocol}://${host}/${monitor.slug}`,
        });
    } catch (err) {
        console.error('Failed to create monitor:', err);
        return Response.json({ error: 'Failed to create monitor' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
        return Response.json({ error: 'id is required' }, { status: 400 });
    }

    const [monitor] = await db.select().from(monitors).where(
        and(eq(monitors.id, id), eq(monitors.userId, userId))
    );
    if (!monitor) {
        return Response.json({ error: 'Not found' }, { status: 404 });
    }

    await db.delete(monitors).where(eq(monitors.id, id));

    return Response.json({ success: true });
}
