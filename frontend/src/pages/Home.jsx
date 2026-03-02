import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as api from '../services/api';

/* ── Use-Cases data ──────────────────────────────────────── */
const USE_CASES = [
    {
        id: 'hr',
        label: '◆ HR',
        headline: 'HR & PEOPLE OPS',
        body: 'From onboarding to policy queries, Botza gives HR teams a 24/7 knowledge assistant. Employees get instant, accurate answers to policy, benefits, and compliance questions — no ticket required.',
        metrics: [
            { num: '60%', desc: 'FEWER HR TICKETS' },
            { num: '3×', desc: 'FASTER ONBOARDING' },
            { num: '94%', desc: 'EMPLOYEE SATISFACTION' },
        ],
        chat: [
            { who: 'user', text: 'What\'s our leave policy for new parents?' },
            { who: 'bot', text: 'Per Section 4.2 of the People Policy (updated Jan 2025): Primary caregivers are entitled to 18 weeks paid leave.', source: 'PEOPLE_POLICY.PDF — S.4.2' },
        ],
    },
    {
        id: 'support',
        label: '◆ SUPPORT',
        headline: 'CUSTOMER SUPPORT',
        body: 'Deflect 70% of tier-1 support tickets instantly. Botza resolves common queries, escalates edge cases, and logs every interaction for compliance — automatically.',
        metrics: [
            { num: '70%', desc: 'TICKET DEFLECTION' },
            { num: '< 2s', desc: 'RESPONSE TIME' },
            { num: '99.9%', desc: 'UPTIME SLA' },
        ],
        chat: [
            { who: 'user', text: 'My order hasn\'t arrived. Order #88291.' },
            { who: 'bot', text: 'Order #88291 shipped 2 days ago via FedEx. Expected delivery: tomorrow by 5 PM.', source: 'ORDER_SYSTEM API' },
        ],
    },
    {
        id: 'legal',
        label: '◆ LEGAL',
        headline: 'LEGAL & COMPLIANCE',
        body: 'Legal teams can query contracts, compliance documents, and regulatory frameworks in seconds. Every answer is cited to its source — audit-ready by design.',
        metrics: [
            { num: '80%', desc: 'FASTER DOCUMENT REVIEW' },
            { num: '100%', desc: 'SOURCE-CITED ANSWERS' },
            { num: '0', desc: 'COMPLIANCE INCIDENTS' },
        ],
        chat: [
            { who: 'user', text: 'What are our GDPR obligations for data retention?' },
            { who: 'bot', text: 'Per your Data Policy v3.1: Customer data must be deleted within 30 days of account closure. Logs retained for 7 years.', source: 'GDPR_POLICY_V3.1.PDF' },
        ],
    },
];

/* ── How-It-Works steps ──────────────────────────────────── */
const STEPS = [
    { num: '01', title: 'INGEST YOUR KNOWLEDGE', body: 'Upload documents, SOPs, wikis, or connect live data sources. Botza processes any format.', icon: 'M4 4h16l2 4H2l2-4zm0 4h16v12H4V8zm4 2v2h8v-2H8zm0 4v2h5v-2H8z' },
    { num: '02', title: 'CONFIGURE YOUR BOT', body: 'No-code builder. Set tone, channels, guardrails, and permissions in minutes.', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
    { num: '03', title: 'DEPLOY ANYWHERE', body: 'Web, Slack, Teams, API — deploy across every channel your teams already use.', icon: 'M12 2l-5.5 9h11L12 2zm0 3.84L14.5 10h-5L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5S15.01 22 17.5 22 22 19.99 22 17.5 19.99 13 17.5 13zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z' },
];

/* ── Stat counter hook ───────────────────────────────────── */
function useCounter(target, duration = 1600) {
    const [count, setCount] = useState(0);
    const started = useRef(false);
    const raf = useRef();
    const start = () => {
        if (started.current) return;
        started.current = true;
        const t0 = performance.now();
        function tick(now) {
            const progress = Math.min((now - t0) / duration, 1);
            setCount(Math.round(progress * target));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        }
        raf.current = requestAnimationFrame(tick);
    };
    useEffect(() => () => cancelAnimationFrame(raf.current), []);
    return [count, start];
}

function StatItem({ num, label, suffix = '' }) {
    const [count, start] = useCounter(num);
    const ref = useRef();
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { start(); obs.disconnect(); } }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [start]);
    return (
        <div className="stat-item" ref={ref}>
            <div className="stat-number">{count}{suffix}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
}

export default function Home() {
    const [activeTab, setActiveTab] = useState('hr');
    const [procStep, setProcStep] = useState(0);
    const [newsletter, setNewsletter] = useState({ email: '', status: '', loading: false });
    const procInterval = useRef();

    /* Cycle process steps */
    useEffect(() => {
        procInterval.current = setInterval(() => setProcStep(s => (s + 1) % 4), 2000);
        return () => clearInterval(procInterval.current);
    }, []);

    /* Fade-up observer */
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [activeTab]);

    /* Newsletter submit */
    const handleNewsletter = useCallback(async (e) => {
        e.preventDefault();
        if (!newsletter.email) return;
        setNewsletter(s => ({ ...s, loading: true, status: '' }));
        try {
            const res = await api.subscribe(newsletter.email);
            setNewsletter(s => ({ ...s, email: '', loading: false, status: res.message ? res.message.toUpperCase() : "WE'LL BE IN TOUCH!" }));
        } catch (err) {
            setNewsletter(s => ({ ...s, loading: false, status: (err.message || 'Error').toUpperCase() }));
        }
        setTimeout(() => setNewsletter(s => ({ ...s, status: '' })), 4000);
    }, [newsletter.email]);

    const activeCase = USE_CASES.find(u => u.id === activeTab) || USE_CASES[0];
    const PROC_LABELS = ['INPUT', 'CHUNKED', 'EMBEDDED', 'RETRIEVABLE'];

    return (
        <>
            <Navbar />

            {/* ── HERO ───────────────────────────────────────────── */}
            <section className="hero" id="hero">
                <div className="hero-bg-grid" aria-hidden="true" />
                <div className="hero-inner">
                    <div className="hero-text">
                        <p className="label hero-label fade-up"><span className="lime">◆</span> ENTERPRISE AI PLATFORM</p>
                        <h1 className="headline hero-headline fade-up">
                            YOUR KNOWLEDGE.<br />
                            <span className="lime">ACTIVATED.</span>
                        </h1>
                        <p className="body hero-body fade-up">
                            Botza transforms raw organizational knowledge into intelligent, governed AI bots — deployed across every channel your teams use.
                        </p>
                        <div className="hero-cta fade-up">
                            <Link to="/#cta" className="btn-primary"><span>REQUEST DEMO</span></Link>
                            <Link to="/product" className="nav-link" style={{ letterSpacing: '0.08em', fontSize: 13 }}>EXPLORE PLATFORM →</Link>
                        </div>
                    </div>
                    <div className="hero-visual fade-up" aria-hidden="true">
                        <div className="hv-card hv-bot">
                            <div className="hv-bot-top">
                                <span className="hv-dot" /><span className="hv-dot" /><span className="hv-dot" />
                                <span className="hv-card-label">BOTZA INTERFACE</span>
                            </div>
                            <div className="hv-chat">
                                <div className="hv-msg hv-user">What's our refund policy for SaaS products?</div>
                                <div className="hv-msg hv-bot">Refunds are available within 30 days of purchase for annual plans. Monthly plans are non-refundable after 48 hours. <span className="hv-source">SOURCE: BILLING_POLICY.PDF</span></div>
                                <div className="hv-msg hv-user">Can we make exceptions for enterprise clients?</div>
                                <div className="hv-typing"><span /><span /><span /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRUST BAR ─────────────────────────────────────── */}
            <section className="trust-bar" id="trust-bar">
                <div className="trust-inner">
                    <p className="trust-label">TRUSTED BY ENTERPRISE TEAMS AT</p>
                    <div className="trust-logos">
                        {['PHARMA CORP', 'NEXUS HEALTH', 'MERIDIAN BANK', 'VORA LOGISTICS', 'ATLAS LEGAL', 'CREST ENERGY'].map(name => (
                            <div key={name} className="trust-logo">{name}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── STATS ─────────────────────────────────────────── */}
            <section className="stats-section" id="stats">
                <div className="stats-inner">
                    <StatItem num={120} label="ENTERPRISE DEPLOYMENTS" suffix="+" />
                    <div className="stat-divider" />
                    <StatItem num={5} label="ENTERPRISE FUNCTIONS" suffix="+" />
                    <div className="stat-divider" />
                    <StatItem num={88} label="MULTI-CHANNEL ADOPTION" suffix="%" />
                    <div className="stat-divider" />
                    <StatItem num={60} label="TICKET DEFLECTION RATE" suffix="%" />
                </div>
            </section>

            {/* ── USE CASES ─────────────────────────────────────── */}
            <section className="usecases" id="usecases">
                <div className="section-inner">
                    <p className="label section-label fade-up"><span className="lime">◆</span> USE CASES</p>
                    <h2 className="headline section-headline fade-up">EVERY TEAM. ONE PLATFORM.</h2>
                    <div className="uc-tabs fade-up" role="tablist">
                        {USE_CASES.map(u => (
                            <button key={u.id} role="tab" className={`uc-tab${activeTab === u.id ? ' active' : ''}`} onClick={() => setActiveTab(u.id)}>{u.label}</button>
                        ))}
                    </div>
                    <div className="uc-panel fade-up">
                        <div className="uc-text">
                            <h3 className="headline uc-headline">{activeCase.headline}</h3>
                            <p className="body uc-body">{activeCase.body}</p>
                            <div className="uc-metrics">
                                {activeCase.metrics.map(m => (
                                    <div key={m.desc} className="uc-metric">
                                        <div className="uc-num">{m.num}</div>
                                        <div className="uc-desc">{m.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="uc-demo">
                            <div className="uc-window">
                                <div className="uc-topbar"><span className="uc-dot" /><span className="uc-dot" /><span className="uc-dot" /><span className="uc-title">BOTZA — {activeCase.headline}</span></div>
                                <div className="uc-chat">
                                    {activeCase.chat.map((m, i) => (
                                        <div key={i} className={`uc-bubble uc-${m.who}`}>
                                            {m.text}
                                            {m.source && <div className="uc-source">{m.source}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────── */}
            <section className="how-it-works" id="how-it-works">
                <div className="section-inner">
                    <p className="label section-label fade-up"><span className="lime">◆</span> HOW IT WORKS</p>
                    <h2 className="headline section-headline fade-up">UP AND RUNNING IN DAYS</h2>
                    <div className="hiw-layout">
                        <div className="hiw-steps">
                            {STEPS.map((step, i) => (
                                <div key={step.num} className="hiw-step fade-up">
                                    <div className="hiw-step-num">{step.num}</div>
                                    <div className="hiw-step-content">
                                        <h3 className="card-title hiw-title">{step.title}</h3>
                                        <p className="body hiw-body">{step.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hiw-visual fade-up" aria-hidden="true">
                            <div className="hiw-pipeline">
                                <div className="pipe-label">KNOWLEDGE PIPELINE</div>
                                <div className="pipe-stages">
                                    {PROC_LABELS.map((label, i) => (
                                        <div key={label} className={`pipe-stage${i === procStep ? ' active' : i < procStep ? ' done' : ''}`}>{label}</div>
                                    ))}
                                </div>
                                <div className="pipe-bar">
                                    <div className="pipe-fill" style={{ width: `${(procStep / 3) * 100}%` }} />
                                </div>
                                <div className="pipe-output">
                                    <span className="lime">→</span> RETRIEVABLE KNOWLEDGE BASE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA / DEMO ────────────────────────────────────── */}
            <section className="cta-section" id="cta">
                <div className="section-inner" style={{ textAlign: 'center' }}>
                    <p className="label section-label fade-up" style={{ justifyContent: 'center' }}><span className="lime">◆</span> GET STARTED</p>
                    <h2 className="headline section-headline fade-up">READY TO ACTIVATE<br />YOUR KNOWLEDGE?</h2>
                    <p className="body cta-body fade-up">Book a 30-minute demo. See Botza live on your use case.</p>
                    <div className="cta-actions fade-up">
                        <a href="mailto:tanisha@indikaai.com" className="btn-primary" id="cta-demo-btn"><span>BOOK A DEMO</span></a>
                        <a href="mailto:tanisha@indikaai.com" className="btn-outline-lime" id="cta-contact-btn">CONTACT US</a>
                    </div>
                    <div className="cta-footnote fade-up">No lock-in. Deployed in days.</div>
                </div>
            </section>

            {/* ── NEWSLETTER ────────────────────────────────────── */}
            <section className="newsletter" id="newsletter">
                <div className="section-rule" style={{ maxWidth: 1200, margin: '0 auto' }} />
                <div className="nl-inner fade-up">
                    <div className="nl-text">
                        <h2 className="headline nl-headline">STAY IN THE LOOP</h2>
                        <p className="body nl-body">AI insights and product updates, direct to your inbox.</p>
                    </div>
                    <form className="nl-form" id="newsletter-form" onSubmit={handleNewsletter}>
                        <input
                            type="email"
                            id="newsletter-email"
                            className="nl-input"
                            placeholder="WORK EMAIL"
                            aria-label="Email for newsletter"
                            required
                            value={newsletter.email}
                            onChange={e => setNewsletter(s => ({ ...s, email: e.target.value }))}
                        />
                        <button type="submit" id="submit-newsletter" className="btn-primary" disabled={newsletter.loading}>
                            <span>{newsletter.loading ? '· · ·' : 'SUBSCRIBE'}</span>
                        </button>
                    </form>
                    {newsletter.status && (
                        <p id="form-status" style={{ marginTop: 10, fontSize: 12, letterSpacing: '0.1em', color: newsletter.status.includes('ERROR') ? '#ff6b6b' : 'var(--lime)' }}>
                            {newsletter.status}
                        </p>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
}
