import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TERMINAL_LINES = [
    '> MISSION: Make enterprise knowledge trustworthy and accessible',
    '> APPROACH: Domain-specific AI + compliance-first architecture',
    '> PRODUCT: BOTZA — modular, governed, intelligent',
    '> STATUS: ACTIVE — deployed across 120+ enterprises',
];

function TerminalBox() {
    const bodyRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        function typeLines() {
            if (cancelled || !bodyRef.current) return;
            bodyRef.current.innerHTML = '';
            TERMINAL_LINES.forEach((line, i) => {
                const div = document.createElement('div');
                div.className = 'term-line';
                div.textContent = line;
                bodyRef.current.appendChild(div);
                setTimeout(() => {
                    if (cancelled) return;
                    div.classList.add('visible');
                    if (i === TERMINAL_LINES.length - 1) {
                        const cursor = document.createElement('span');
                        cursor.className = 'term-cursor';
                        div.appendChild(cursor);
                    }
                }, i * 600);
            });
            setTimeout(() => {
                if (cancelled || !bodyRef.current) return;
                bodyRef.current.querySelectorAll('.term-line').forEach(l => l.classList.remove('visible'));
                setTimeout(typeLines, 600);
            }, 8000);
        }
        const t = setTimeout(typeLines, 500);
        return () => { cancelled = true; clearTimeout(t); };
    }, []);

    return (
        <div className="terminal-box fade-up" id="terminal-box">
            <div className="terminal-topbar">
                <span className="terminal-dot" /><span className="terminal-dot" /><span className="terminal-dot" />
                <span className="terminal-title">indika_ai_terminal</span>
            </div>
            <div className="terminal-body" id="terminal-body" ref={bodyRef} />
        </div>
    );
}

export default function About() {
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, []);

    return (
        <>
            <Navbar />

            {/* ABOUT HERO */}
            <section className="about-hero" id="about-hero">
                <div className="about-hero-inner">
                    <p className="label section-label fade-up" style={{ justifyContent: 'center' }}><span className="lime">◆</span> ABOUT INDIKA AI</p>
                    <h1 className="headline section-headline about-hero-h fade-up">BUILDING INTELLIGENCE<br />THAT ENTERPRISES TRUST</h1>
                    <p className="about-hero-sub fade-up">Indika AI is a team of AI engineers, enterprise architects, and product builders focused on making organizational knowledge actionable, governed, and scalable.</p>
                    <TerminalBox />
                </div>
            </section>

            {/* MISSION */}
            <section className="about-mission" id="about-mission">
                <div className="section-inner">
                    <div className="mission-layout">
                        <div className="mission-text fade-up">
                            <p className="label section-label"><span className="lime">◆</span> WHY WE EXIST</p>
                            <h2 className="headline section-headline">THE KNOWLEDGE CRISIS</h2>
                            <p className="mission-body">Enterprises sit on mountains of institutional knowledge — scattered across drives, wikis, ticketing systems, and the minds of departing employees. Without structure, that knowledge goes dark.</p>
                            <p className="mission-body">We built Botza to solve this: an AI platform that ingests, structures, and activates enterprise knowledge — with the governance and compliance controls that regulated industries demand.</p>
                        </div>
                        <div className="mission-stats fade-up">
                            <div className="botza-card mission-stat-card"><div className="card-title ms-num">120<span className="ms-unit">+</span></div><div className="body ms-desc">Enterprise Deployments</div></div>
                            <div className="botza-card mission-stat-card"><div className="card-title ms-num">5<span className="ms-unit">+</span></div><div className="body ms-desc">Functions Covered</div></div>
                            <div className="botza-card mission-stat-card"><div className="card-title ms-num">88<span className="ms-unit">%</span></div><div className="body ms-desc">Multi-Channel Adoption</div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VALUES */}
            <section className="about-values" id="about-values">
                <div className="section-inner">
                    <h2 className="headline section-headline fade-up" style={{ marginBottom: 48 }}>WHAT DRIVES US</h2>
                    <div className="values-grid fade-up">
                        <div className="botza-card value-card" id="val-trust">
                            <h3 className="card-title value-name">TRUST FIRST</h3>
                            <p className="body value-desc">We build AI that enterprises can audit, control, and rely on. Every response is traceable. Every model is governed.</p>
                        </div>
                        <div className="botza-card value-card" id="val-depth">
                            <h3 className="card-title value-name">DOMAIN DEPTH</h3>
                            <p className="body value-desc">Generic AI isn't enough. We train on your world — your documents, your policies, your language — for superior accuracy.</p>
                        </div>
                        <div className="botza-card value-card" id="val-speed">
                            <h3 className="card-title value-name">SPEED WITHOUT COMPROMISE</h3>
                            <p className="body value-desc">Deploy in days, not quarters. Governance included from day one — no trade-offs between speed and compliance.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPANY */}
            <section className="about-company" id="about-company">
                <div className="section-inner" style={{ textAlign: 'center' }}>
                    <h2 className="headline section-headline fade-up" style={{ marginBottom: 24 }}>BUILT BY INDIKA AI</h2>
                    <p className="about-company-body fade-up">Indika AI is a product-first AI company building enterprise-grade knowledge intelligence tools. We believe organizational knowledge is the most under-utilised asset in every company — and we're fixing that.</p>
                    <div className="about-links fade-up">
                        <a href="https://www.indikaai.com" target="_blank" rel="noopener" className="about-link lime">WWW.INDIKAAI.COM →</a>
                        <a href="mailto:tanisha@indikaai.com" className="about-link">TANISHA@INDIKAAI.COM</a>
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section className="page-bottom-cta">
                <div className="section-rule" style={{ maxWidth: 1200, margin: '0 auto' }} />
                <div className="pbc-inner fade-up">
                    <h2 className="section-headline" style={{ textAlign: 'center' }}>LET'S WORK TOGETHER</h2>
                    <a href="mailto:tanisha@indikaai.com" className="btn-outline-lime" id="about-cta-btn">GET IN TOUCH</a>
                </div>
            </section>

            <Footer />
        </>
    );
}
