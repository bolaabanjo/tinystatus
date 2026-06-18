'use client';

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, FormEvent } from 'react';

interface Monitor {
    id: string;
    slug: string;
    url: string;
    displayName: string;
    createdAt: string;
}

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const ExternalIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7M7 7h10v10" />
    </svg>
);

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [url, setUrl] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [slug, setSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            router.push('/');
            return;
        }
        fetchMonitors();
    }, [isLoaded, user]);

    async function fetchMonitors() {
        try {
            const res = await fetch('/api/monitors');
            const data = await res.json();
            setMonitors(data);
        } catch {
            setError('Failed to load monitors');
        } finally {
            setLoading(false);
        }
    }

    async function onCreate(e: FormEvent) {
        e.preventDefault();
        if (!url.trim() || !displayName.trim() || creating) return;
        setCreating(true);
        setError('');

        try {
            const res = await fetch('/api/monitors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url.trim(),
                    displayName: displayName.trim(),
                    slug: slug.trim() || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create');

            setMonitors((prev) => [data, ...prev]);
            setUrl('');
            setDisplayName('');
            setSlug('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    }

    async function onDelete(id: string) {
        try {
            const res = await fetch(`/api/monitors?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setMonitors((prev) => prev.filter((m) => m.id !== id));
        } catch {
            setError('Failed to delete monitor');
        }
    }

    if (!isLoaded || !user) {
        return (
            <div className="landing">
                <div className="landing-bg" />
                <div className="landing-inner"><div className="loading-dots"><span /><span /><span /></div></div>
            </div>
        );
    }

    return (
        <div className="landing">
            <div className="landing-bg" />
            <div className="landing-inner" style={{ maxWidth: 640, paddingTop: '3rem' }}>
                {/* Header */}
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="brand-title" style={{ fontSize: '1.25rem' }}>tinystatus</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{user.emailAddresses[0]?.emailAddress}</span>
                        <SignOutButton>
                            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                Sign out
                            </button>
                        </SignOutButton>
                    </div>
                </div>

                {/* Create Form */}
                <div className="outer-shell">
                    <div className="inner-core" style={{ padding: '1.25rem', gap: '1rem' }}>
                        <h2 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em' }}>New Monitor</h2>
                        <form onSubmit={onCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <input
                                    className="form-input"
                                    style={{ flex: 2, minWidth: 200 }}
                                    type="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                />
                                <input
                                    className="form-input"
                                    style={{ flex: 1, minWidth: 140 }}
                                    type="text"
                                    placeholder="Display name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />
                                <input
                                    className="form-input"
                                    style={{ flex: 1, minWidth: 120 }}
                                    type="text"
                                    placeholder="Slug (optional)"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <button
                                    type="submit"
                                    className="btn-create"
                                    style={{ padding: '0.55rem 0.55rem 0.55rem 1.25rem', fontSize: '0.85rem', width: 'auto', marginTop: 0 }}
                                    disabled={creating || !url.trim() || !displayName.trim()}
                                >
                                    {creating ? (
                                        <div className="loading-dots"><span /><span /><span /></div>
                                    ) : (
                                        <>Create</>
                                    )}
                                    <span className="btn-icon-ring" style={{ width: 28, height: 28 }}>
                                        <PlusIcon />
                                    </span>
                                </button>
                                {error && <span style={{ fontSize: '0.8rem', color: '#ff4444' }}>{error}</span>}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Monitor List */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        Your Monitors
                    </h2>

                    {loading ? (
                        <div className="empty-state">Loading...</div>
                    ) : monitors.length === 0 ? (
                        <div className="empty-state">No monitors yet. Create one above.</div>
                    ) : (
                        monitors.map((m) => (
                            <div key={m.id} className="outer-shell" style={{ padding: '1px' }}>
                                <div className="inner-core" style={{ padding: '0.75rem 1rem', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {m.displayName}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {m.url}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                                        <a
                                            href={`https://tinystatus.bolabanjo.xyz/${m.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-icon-ring"
                                            style={{ width: 30, height: 30, background: 'var(--input-bg)', display: 'flex' }}
                                            title="View status page"
                                        >
                                            <ExternalIcon />
                                        </a>
                                        <button
                                            onClick={() => onDelete(m.id)}
                                            className="btn-icon-ring"
                                            style={{ width: 30, height: 30, background: 'var(--input-bg)', display: 'flex', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
                                            title="Delete monitor"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
