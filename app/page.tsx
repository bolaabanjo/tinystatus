'use client';

import { useState, FormEvent } from 'react';

const ArrowUpRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

export default function Home() {
    const [url, setUrl] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ slug: string; statusPageUrl: string } | null>(null);
    const [error, setError] = useState('');

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!url.trim() || !displayName.trim() || loading) return;

        setLoading(true);
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

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            setResult(data);
        } catch {
            setError('Failed to connect. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setUrl('');
        setDisplayName('');
        setSlug('');
        setResult(null);
        setError('');
    };

    return (
        <div className="landing">
            <div className="landing-bg" />

            <div className="landing-inner">
                <div className="brand">
                    <div className="brand-title">tinystatus</div>
                    <div className="brand-tagline">
                        Paste a URL. Get a public status page.<br />
                        AI explains every incident.
                    </div>
                </div>

                {!result ? (
                    <div className="outer-shell">
                        <div className="inner-core">
                            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="url">URL to Monitor</label>
                                    <input
                                        id="url"
                                        className="form-input"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="displayName">Display Name</label>
                                    <input
                                        id="displayName"
                                        className="form-input"
                                        type="text"
                                        placeholder="My Website"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" htmlFor="slug">Slug (optional)</label>
                                    <input
                                        id="slug"
                                        className="form-input"
                                        type="text"
                                        placeholder="my-website"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                    />
                                    <span className="form-hint">
                                        tinystatus.vercel.app/{slug || 'your-slug'}
                                    </span>
                                </div>

                                {error && <div className="error-banner">{error}</div>}

                                <button
                                    type="submit"
                                    className="btn-create"
                                    disabled={loading || !url.trim() || !displayName.trim()}
                                >
                                    {loading ? (
                                        <div className="loading-dots">
                                            <span /><span /><span />
                                        </div>
                                    ) : (
                                        <>Create Status Page</>
                                    )}
                                    <span className="btn-icon-ring">
                                        {loading ? <span style={{ opacity: 0.4 }}><CheckIcon /></span> : <ArrowUpRight />}
                                    </span>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="result-card">
                        <div className="outer-shell">
                            <div className="inner-core" style={{ gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--accent)' }}><CheckIcon /></span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Status page created</span>
                                </div>

                                <div className="result-url">
                                    <span>{result.statusPageUrl}</span>
                                </div>

                                <div className="result-actions">
                                    <a
                                        href={result.statusPageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-visit"
                                    >
                                        View Status Page
                                        <ArrowUpRight />
                                    </a>
                                    <button onClick={reset} className="btn-create-another">
                                        Create Another
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="landing-footer">
                Powered by{' '}
                <a href="https://cencori.com" target="_blank" rel="noopener noreferrer">Cencori</a>
            </div>
        </div>
    );
}
