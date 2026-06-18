import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { monitors, checkResults, incidents } from '../lib/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema: { monitors, checkResults, incidents } });

const CENCORI_API_KEY = process.env.CENCORI_API_KEY!;
const TIMEOUT_MS = 15000;

interface CheckOutcome {
    status: 'up' | 'down' | 'degraded';
    statusCode: number | null;
    latencyMs: number;
    error: string | null;
}

async function checkUrl(url: string): Promise<CheckOutcome> {
    const start = performance.now();
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const res = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'User-Agent': 'tinystatus/1.0' },
            redirect: 'follow',
        });

        clearTimeout(id);
        const latency = Math.round(performance.now() - start);
        const code = res.status;

        if (code >= 200 && code < 300) {
            return { status: 'up', statusCode: code, latencyMs: latency, error: null };
        }
        if (code >= 300 && code < 400) {
            return { status: 'up', statusCode: code, latencyMs: latency, error: null };
        }
        if (code >= 500) {
            return { status: 'down', statusCode: code, latencyMs: latency, error: `HTTP ${code}` };
        }
        return { status: 'degraded', statusCode: code, latencyMs: latency, error: null };
    } catch (err: any) {
        const latency = Math.round(performance.now() - start);
        if (err.name === 'AbortError') {
            return { status: 'down', statusCode: null, latencyMs: latency, error: 'timeout' };
        }
        return { status: 'down', statusCode: null, latencyMs: latency, error: err.message || 'unknown error' };
    }
}

async function generateSummary(
    monitorUrl: string,
    displayName: string,
    startedAt: Date,
    resolvedAt: Date,
    rawData: any
): Promise<string> {
    const duration = Math.round((resolvedAt.getTime() - startedAt.getTime()) / 1000);
    const prompt = `Summarize this incident in 2-3 sentences. Include: when it started, how long it lasted, what errors occurred, and any patterns. Tone: direct, technical, calm.

Monitor: ${displayName} (${monitorUrl})
Started: ${startedAt.toISOString()}
Duration: ${duration}s
Check data: ${JSON.stringify(rawData)}`;

    try {
        const res = await fetch('https://api.cencori.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CENCORI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 256,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`AI summary failed (${res.status}): ${text}`);
            return `Incident resolved after ${Math.round(duration / 60)} minutes.`;
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || '';
    } catch (err) {
        console.error('AI summary request failed:', err);
        return `Incident resolved after ${Math.round(duration / 60)} minutes.`;
    }
}

async function processMonitor(monitor: typeof monitors.$inferSelect) {
    const outcome = await checkUrl(monitor.url);

    const [check] = await db.insert(checkResults).values({
        monitorId: monitor.id,
        status: outcome.status,
        statusCode: outcome.statusCode,
        latencyMs: outcome.latencyMs,
        region: 'github-actions',
        error: outcome.error,
    }).returning();

    console.log(`  [${monitor.slug}] ${outcome.status} ${outcome.latencyMs}ms ${outcome.error ? '(' + outcome.error + ')' : ''}`);

    // Get last 2 checks for this monitor
    const lastChecks = await db.query.checkResults.findMany({
        where: eq(checkResults.monitorId, monitor.id),
        orderBy: [desc(checkResults.checkedAt)],
        limit: 2,
    });

    const allDown = lastChecks.length >= 2 && lastChecks.every((c) => c.status !== 'up');
    const currentUp = outcome.status === 'up';

    // Find open incident
    const openIncident = await db.query.incidents.findFirst({
        where: and(
            eq(incidents.monitorId, monitor.id),
            sql`${incidents.resolvedAt} IS NULL`
        ),
    });

    if (allDown && !openIncident) {
        // Create a new incident
        const severity = lastChecks.some((c) => c.status === 'down') ? 'down' : 'degraded';
        await db.insert(incidents).values({
            monitorId: monitor.id,
            startedAt: lastChecks[0].checkedAt,
            severity,
            rawData: lastChecks,
        });
        console.log(`  → Incident created (${severity})`);
    }

    if (currentUp && openIncident) {
        // Resolve incident and generate AI summary
        const rawData = await db.query.checkResults.findMany({
            where: and(
                eq(checkResults.monitorId, monitor.id),
                sql`${checkResults.checkedAt} >= ${openIncident.startedAt}`
            ),
            orderBy: [desc(checkResults.checkedAt)],
        });

        const now = new Date();
        const summary = await generateSummary(
            monitor.url,
            monitor.displayName,
            openIncident.startedAt,
            now,
            rawData
        );

        await db.update(incidents)
            .set({ resolvedAt: now, aiSummary: summary, rawData })
            .where(eq(incidents.id, openIncident.id));

        console.log(`  → Incident resolved, AI summary generated`);
    }
}

async function main() {
    console.log(`[tinystatus] Check run starting at ${new Date().toISOString()}`);

    const allMonitors = await db.query.monitors.findMany();
    console.log(`  Found ${allMonitors.length} monitors`);

    for (const monitor of allMonitors) {
        await processMonitor(monitor);
    }

    console.log(`[tinystatus] Check run complete`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
