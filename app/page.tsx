'use client';

import { useUser } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ArrowUpRight = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" /><path d="M7 7h10v10" />
    </svg>
);

const features = [
    { title: 'AI Incident Summaries', desc: 'AI writes post-mortems in plain English. No more digging through logs.' },
    { title: '3-Region Monitoring', desc: 'Distributed pinging from 3 global regions. You know before your users do.' },
    { title: 'Public Status Page', desc: 'A live status page at your own slug. Share it, no login needed to view.' },
    { title: '30-Day Timeline', desc: 'Daily uptime sparklines with color-coded incident markers.' },
    { title: 'Automatic Detection', desc: 'Consecutive failures trigger incidents automatically.' },
    { title: 'Free Forever', desc: 'No credit card. No time limit. One paste and you are monitoring.' },
];

const steps = [
    { title: 'Paste a URL', desc: 'Enter the URL you want to monitor. Give it a name and optional slug.' },
    { title: 'Get a Status Page', desc: 'We generate a public page at your slug with live indicator and timeline.' },
    { title: 'AI Does the Rest', desc: 'We ping from 3 regions. When something fails, AI writes the summary.' },
];

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) router.push('/dashboard');
    }, [isLoaded, user, router]);

    if (isLoaded && user) {
        return (
            <div className="landing"><div className="landing-bg" />
                <div className="loading-dots" style={{ padding: '2rem', justifyContent: 'center' }}><span /><span /><span /></div>
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
                                <span className="btn-icon-ring"><ArrowUpRight /></span>
                            </button>
                        </SignUpButton>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="lp-section">
                <div className="lp-section-inner lp-hero-inner">
                    <div className="lp-hero-eyebrow">AI-Powered Uptime Intelligence</div>
                    <h1 className="lp-hero-title">
                        Know when your site goes down.<br />
                        <span className="lp-accent">AI explains why.</span>
                    </h1>
                    <p className="lp-hero-sub">
                        Paste a URL. Get a public status page. AI monitors, detects incidents,<br />
                        and writes post-mortems automatically. Free forever.
                    </p>
                    <div className="lp-hero-actions">
                        <SignUpButton mode="modal">
                            <button className="lp-btn-primary">
                                Start Monitoring Free
                                <span className="btn-icon-ring" style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.1)' }}><ArrowUpRight /></span>
                            </button>
                        </SignUpButton>
                        <a href="https://tinystatus.bolabanjo.xyz/example" target="_blank" rel="noopener noreferrer" className="lp-btn-secondary">
                            View Example
                        </a>
                    </div>
                </div>
            </section>

            {/* Preview — border-driven */}
            <section className="lp-section lp-preview-section">
                <div className="lp-preview-grid">
                    <div className="lp-preview-cell">
                        <span className="lp-preview-cell-label">Status</span>
                        <span className="lp-preview-cell-value" style={{ color: 'rgba(128,128,128,0.6)' }}>● All Systems Operational</span>
                    </div>
                    <div className="lp-preview-cell" style={{ textAlign: 'right' }}>
                        <span className="lp-preview-cell-label">Response Time</span>
                        <span className="lp-preview-cell-value">142 ms avg</span>
                        <span className="lp-preview-cell-sub">last 30 days</span>
                    </div>
                </div>
                <div className="lp-preview-bar-row">
                    {[96, 100, 100, 88, 100, 100, 100, 72, 100, 100, 100, 100, 95, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100].map((pct, i) => (
                        <div key={i} className={`lp-preview-bar ${pct < 100 ? 'down' : 'up'}`} style={{ height: `${Math.max(3, (pct / 100) * 24)}px` }} />
                    ))}
                </div>
                <div className="lp-preview-incident-row">
                    <span className="lp-preview-inc-badge">DOWN</span>
                    <div className="lp-preview-inc-text">
                        <span className="lp-preview-inc-title">Jun 15, 2026 — 503 errors for 12 min</span>
                        <span className="lp-preview-inc-desc">The endpoint returned HTTP 503 for 12 minutes. 4 checks failed across all regions. Likely a temporary upstream deployment.</span>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="lp-section">
                <div className="lp-section-inner" style={{ gap: '0.5rem' }}>
                    <h2 className="lp-section-title">Everything you need</h2>
                    <p className="lp-section-sub">No green dots. No manual post-mortems. tinystatus does the hard part.</p>
                    <div className="lp-features-grid">
                        {features.map((f, i) => (
                            <div key={i} className="lp-feature-cell">
                                <div className="lp-feature-title">{f.title}</div>
                                <div className="lp-feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="lp-section">
                <div className="lp-section-inner" style={{ gap: '0.5rem' }}>
                    <h2 className="lp-section-title">Three steps</h2>
                    <p className="lp-section-sub">No dashboard to learn. No config to tweak.</p>
                    <div className="lp-steps-grid">
                        {steps.map((s, i) => (
                            <div key={i} className="lp-step-cell">
                                <span className="lp-step-num">0{i + 1}</span>
                                <div className="lp-step-title">{s.title}</div>
                                <div className="lp-step-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="lp-section">
                <div className="lp-section-inner lp-cta-inner" style={{ gap: '1rem' }}>
                    <h2 className="lp-section-title" style={{ fontSize: '1.1rem' }}>Start monitoring in 10 seconds.</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Free forever. No credit card. No time limit.</p>
                    <SignUpButton mode="modal">
                        <button className="lp-btn-primary" style={{ marginTop: '0.5rem' }}>
                            Get Started Free
                            <span className="btn-icon-ring" style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.1)' }}><ArrowUpRight /></span>
                        </button>
                    </SignUpButton>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-inner" style={{ borderTop: '1px solid rgba(128,128,128,0.08)' }}>
                    <span className="lp-logo" style={{ fontSize: '0.82rem' }}>tinystatus</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        Powered by <a href="https://cencori.com" target="_blank" rel="noopener noreferrer">Cencori</a>
                    </span>
                </div>
            </footer>
        </div>
    );
}
