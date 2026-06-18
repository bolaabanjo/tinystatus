'use client';

import { useUser } from '@clerk/nextjs';
import { SignUpButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ArrowUpRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17 17 7" /><path d="M7 7h10v10" />
    </svg>
);

export default function Home() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.push('/dashboard');
        }
    }, [isLoaded, user]);

    if (isLoaded && user) {
        return (
            <div className="landing">
                <div className="landing-bg" />
                <div className="landing-inner">
                    <div className="loading-dots"><span /><span /><span /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="landing">
            <div className="landing-bg" />
            <div className="landing-inner">
                <div className="brand">
                    <div className="brand-title">tinystatus</div>
                    <div className="brand-tagline">
                        AI-powered uptime intelligence.<br />
                        Paste a URL. Get a public status page.
                    </div>
                </div>

                <div className="outer-shell">
                    <div className="inner-core" style={{ alignItems: 'center', textAlign: 'center', gap: '1.25rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                            Create a status page for any URL.<br />
                            AI monitors it, detects incidents,<br />
                            and writes summaries automatically.
                        </p>

                        <SignUpButton mode="modal">
                            <button className="btn-create" style={{ marginTop: 0 }}>
                                Get Started
                                <span className="btn-icon-ring"><ArrowUpRight /></span>
                            </button>
                        </SignUpButton>

                        <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            Free. No credit card.
                        </p>
                    </div>
                </div>

                <div className="landing-footer">
                    Powered by <a href="https://cencori.com" target="_blank" rel="noopener noreferrer">Cencori</a>
                </div>
            </div>
        </div>
    );
}
