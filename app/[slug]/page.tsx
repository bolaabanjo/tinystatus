import { db } from '@/lib/db';
import { monitors, checkResults, incidents } from '@/lib/schema';
import { eq, desc, gte, and, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ slug: string }>;
}

function formatDuration(start: Date, end: Date | null): string {
    if (!end) return 'Ongoing';
    const ms = end.getTime() - start.getTime();
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remain = mins % 60;
    return remain > 0 ? `${hours}h ${remain}m` : `${hours}h`;
}

function Sparkline({ days }: { days: { date: string; pct: number }[] }) {
    const barWidth = 100 / days.length;
    return (
        <svg width="100%" height="40" viewBox={`0 0 ${days.length * 8} 40`} preserveAspectRatio="none">
            {days.map((day, i) => {
                const h = Math.max(2, (day.pct / 100) * 36);
                const color = day.pct >= 99 ? 'var(--accent)' : day.pct >= 95 ? '#f59e0b' : '#ef4444';
                return (
                    <rect
                        key={day.date}
                        x={i * 8}
                        y={40 - h}
                        width={6}
                        height={h}
                        fill={color}
                        rx={1}
                    />
                );
            })}
        </svg>
    );
}

export default async function StatusPage({ params }: PageProps) {
    const { slug } = await params;

    const monitor = await db.query.monitors.findFirst({
        where: eq(monitors.slug, slug),
    });
    if (!monitor) notFound();

    const latestCheck = await db.query.checkResults.findFirst({
        where: eq(checkResults.monitorId, monitor.id),
        orderBy: [desc(checkResults.checkedAt)],
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentChecks = await db.query.checkResults.findMany({
        where: and(
            eq(checkResults.monitorId, monitor.id),
            gte(checkResults.checkedAt, thirtyDaysAgo)
        ),
        orderBy: [desc(checkResults.checkedAt)],
    });

    const incidentList = await db.query.incidents.findMany({
        where: eq(incidents.monitorId, monitor.id),
        orderBy: [desc(incidents.startedAt)],
    });

    const unresolved = incidentList.find((i) => !i.resolvedAt);
    const hasData = recentChecks.length > 0;

    const statusColor = !hasData ? 'var(--muted)' :
        unresolved ? '#ef4444' :
        latestCheck?.status === 'down' ? '#ef4444' :
        latestCheck?.status === 'degraded' ? '#f59e0b' :
        'var(--accent)';

    const statusLabel = !hasData ? 'Waiting for first check...' :
        unresolved ? 'Service Disruption' :
        latestCheck?.status === 'down' ? 'Service Disruption' :
        latestCheck?.status === 'degraded' ? 'Degraded Performance' :
        'All Systems Operational';

    const avgLatency = hasData
        ? Math.round(recentChecks.reduce((s, c) => s + (c.latencyMs || 0), 0) / recentChecks.length)
        : null;

    const uptime30d = hasData
        ? recentChecks.filter((c) => c.status === 'up').length / recentChecks.length * 100
        : null;

    const dailyBars: { date: string; pct: number }[] = [];
    if (hasData) {
        const byDay = new Map<string, { up: number; total: number }>();
        for (const c of recentChecks) {
            const d = c.checkedAt.toISOString().slice(0, 10);
            const entry = byDay.get(d) || { up: 0, total: 0 };
            entry.total++;
            if (c.status === 'up') entry.up++;
            byDay.set(d, entry);
        }
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
            const data = byDay.get(d);
            dailyBars.push({ date: d, pct: data ? (data.up / data.total) * 100 : 100 });
        }
    }

    return (
        <div className="status-page">
            <div className="status-bg" />
            <div className="status-inner">
                {/* Header */}
                <div className="status-header">
                    <div className="status-brand">tinystatus</div>
                    <div className="status-meta">
                        <span className="status-url">{monitor.url}</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="status-badge-row">
                    <span
                        className="status-dot"
                        style={{
                            background: statusColor,
                            boxShadow: `0 0 12px ${statusColor}40`,
                        }}
                    />
                    <span className="status-label" style={{ color: statusColor }}>
                        {statusLabel}
                    </span>
                </div>

                {/* Stats Row */}
                <div className="status-stats">
                    {uptime30d !== null && (
                        <div className="stat">
                            <span className="stat-value">{uptime30d.toFixed(1)}%</span>
                            <span className="stat-label">uptime (30d)</span>
                        </div>
                    )}
                    {avgLatency !== null && (
                        <div className="stat">
                            <span className="stat-value">{avgLatency}ms</span>
                            <span className="stat-label">avg latency</span>
                        </div>
                    )}
                    <div className="stat">
                        <span className="stat-value">
                            {monitor.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="stat-label">monitoring since</span>
                    </div>
                </div>

                {/* 30-Day Timeline */}
                <div className="status-section">
                    <h2 className="section-title">30-Day Timeline</h2>
                    <div className="sparkline-container">
                        {hasData ? (
                            <Sparkline days={dailyBars} />
                        ) : (
                            <div className="empty-state">Collecting data — check back soon.</div>
                        )}
                    </div>
                    <div className="sparkline-labels">
                        <span>{thirtyDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Incidents */}
                <div className="status-section">
                    <h2 className="section-title">Incidents</h2>
                    {incidentList.length === 0 ? (
                        <div className="empty-state">
                            No incidents recorded.
                        </div>
                    ) : (
                        <div className="incidents-list">
                            {incidentList.map((inc) => (
                                <div key={inc.id} className="incident-card">
                                    <div className="incident-header">
                                        <span className={`incident-severity ${inc.severity}`}>
                                            {inc.severity === 'down' ? 'DOWN' : 'DEGRADED'}
                                        </span>
                                        <span className="incident-date">
                                            {inc.startedAt.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <span className="incident-duration">
                                            {formatDuration(inc.startedAt, inc.resolvedAt)}
                                        </span>
                                    </div>
                                    {inc.aiSummary && (
                                        <p className="incident-summary">{inc.aiSummary}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="status-footer">
                    Powered by <a href="https://cencori.com" target="_blank" rel="noopener noreferrer">Cencori</a>
                </div>
            </div>
        </div>
    );
}
