'use client';

import { useUser } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ArrowUpRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" /><path d="M7 7h10v10" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const features = [
    { title: 'AI Incident Summaries', desc: 'When something breaks, AI writes the post-mortem in plain English. No more digging through logs.' },
    { title: '3-Region Monitoring', desc: 'Distributed pinging from N. Virginia, Frankfurt, and São Paulo. You know before your users do.' },
    { title: 'Public Status Page', desc: 'A beautiful, live status page at your own slug. Share it with anyone, no login needed to view.' },
    { title: '30-Day Timeline', desc: 'Daily uptime sparklines with color-coded incident markers. See reliability at a glance.' },
    { title: 'Automatic Detection', desc: 'Consecutive failures trigger incidents automatically. AI summarizes what happened and when.' },
    { title: 'Free Forever', desc: 'No credit card. No time limit. One paste and you\'re monitoring.' },
];

const steps = [
    { num: '01', title: 'Paste a URL', desc: 'Enter the URL you want to monitor. Give it a name and an optional slug.' },
    { num: '02', title: 'Get a Status Page', desc: 'We generate a public page at your slug. Live indicator, uptime timeline, and incident feed.' },
    { num: '03', title: 'AI Does the Rest', desc: 'We ping from 3 regions every 5 minutes. When something fails, AI writes the summary.' },
];

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.push('/dashboard');
        }
    }, [isLoaded, user, router]);

    if (isLoaded && user) {
        return (
            <div className="landing"><div className="landing-bg" />
                <div className="landing-inner"><div className="loading-dots"><span /><span /><span /></div></div>
            </div>
        );
    }

    return (
        <div className="landing">
            <div className="landing-bg" />

            {/* Nav */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <span className="lp-logo">tinystatus</span>
                    <div className="lp-nav-links">
                        <SignInButton mode="modal">
                            <button className="lp-nav-btn">Sign in</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="lp-nav-cta">
                                Get Started
                                <span className="btn-icon-ring" style={{ width: 24, height: 24 }}><ArrowUpRight /></span>
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="lp-section lp-hero">
                <div className="lp-hero-eyebrow">AI-Powered Uptime Intelligence</div>
                <h1 className="lp-hero-title">
                    Know when your<br />site goes down.<br />
                    <span className="lp-accent">AI explains why.</span>
                </h1>
                <p className="lp-hero-sub">
                    Paste a URL. Get a public status page. AI monitors, detects incidents,<br />
                    and writes post-mortems automatically. Free forever.
                </p>
                <div className="lp-hero-actions">
                    <SignUpButton mode="modal">
                        <button className="btn-create" style={{ width: 'auto', padding: '0.75rem 0.75rem 0.75rem 1.5rem', marginTop: 0 }}>
                            Start Monitoring Free
                            <span className="btn-icon-ring"><ArrowUpRight /></span>
                        </button>
                    </SignUpButton>
                    <a href="https://tinystatus.bolabanjo.xyz/example" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.75rem 1.25rem' }}>
                        View Example
                    </a>
                </div>
            </section>

            {/* Status Preview */}
            <section className="lp-section" style={{ paddingTop: 0 }}>
                <div className="lp-preview-shell">
                    <div className="lp-preview-inner">
                        <div className="lp-preview-header">
                            <span className="lp-preview-brand">tinystatus</span>
                            <span className="lp-preview-url">example.com</span>
                        </div>
                        <div className="lp-preview-badge">
                            <span className="status-dot" style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)40' }} />
                            <span style={{ color: 'var(--accent)', fontWeight: 500, fontSize: '0.85rem' }}>All Systems Operational</span>
                        </div>
                        <div className="lp-preview-stats">
                            <div className="lp-preview-stat"><span className="lp-preview-stat-val">100%</span><span className="lp-preview-stat-lbl">uptime (30d)</span></div>
                            <div className="lp-preview-stat"><span className="lp-preview-stat-val">142ms</span><span className="lp-preview-stat-lbl">avg latency</span></div>
                            <div className="lp-preview-stat"><span className="lp-preview-stat-val">Jun 17</span><span className="lp-preview-stat-lbl">monitoring since</span></div>
                        </div>
                        <div className="lp-preview-sparkline">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className="lp-preview-bar" style={{ height: `${20 + Math.random() * 20}px`, background: 'var(--accent)' }} />
                            ))}
                        </div>
                        <div className="lp-preview-incident">
                            <div className="lp-preview-inc-badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>DOWN</div>
                            <div className="lp-preview-inc-text">
                                <div className="lp-preview-inc-title">Jun 15, 2026 — 503 errors (12 min)</div>
                                <div className="lp-preview-inc-desc">The endpoint returned HTTP 503 for 12 minutes starting at 14:23 UTC. Likely a temporary upstream deployment.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="lp-section">
                <h2 className="lp-section-title">Everything you need to sleep better</h2>
                <p className="lp-section-sub">No more green dots and manual post-mortems. tinystatus does the hard part.</p>
                <div className="lp-features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="lp-feature-card">
                            <div className="lp-feature-icon"><CheckIcon /></div>
                            <h3 className="lp-feature-title">{f.title}</h3>
                            <p className="lp-feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="lp-section">
                <h2 className="lp-section-title">Three steps to reliability</h2>
                <p className="lp-section-sub">No dashboard to learn. No config to tweak.</p>
                <div className="lp-steps">
                    {steps.map((s, i) => (
                        <div key={i} className="lp-step">
                            <span className="lp-step-num">{s.num}</span>
                            <h3 className="lp-step-title">{s.title}</h3>
                            <p className="lp-step-desc">{s.desc}</p>
                            {i < steps.length - 1 && <div className="lp-step-line" />}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="lp-section lp-cta-section">
                <div className="outer-shell" style={{ borderColor: 'rgba(0, 212, 170, 0.2)' }}>
                    <div className="inner-core" style={{ alignItems: 'center', textAlign: 'center', gap: '1.5rem', padding: '3rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.03em' }}>
                            Start monitoring in 10 seconds.
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', maxWidth: 400 }}>
                            Free forever. No credit card. No time limit.
                        </p>
                        <SignUpButton mode="modal">
                            <button className="btn-create" style={{ width: 'auto', padding: '0.75rem 0.75rem 0.75rem 1.5rem', marginTop: 0 }}>
                                Get Started Free
                                <span className="btn-icon-ring"><ArrowUpRight /></span>
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <span className="lp-logo" style={{ fontSize: '0.85rem' }}>tinystatus</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Powered by <a href="https://cencori.com" target="_blank" rel="noopener noreferrer">Cencori</a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
