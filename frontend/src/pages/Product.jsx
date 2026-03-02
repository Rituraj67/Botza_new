import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Product() {
    // Module grid reveal animation
    useEffect(() => {
        const grid = document.getElementById('module-grid');
        if (!grid) return;
        const tiles = grid.querySelectorAll('.module-tile');
        const dirMap = { left: [-40, 0], right: [40, 0], top: [0, -40], bottom: [0, 40] };
        tiles.forEach(tile => {
            const [dx, dy] = dirMap[tile.dataset.dir || 'left'] || [0, 0];
            tile.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    tiles.forEach((tile, i) => setTimeout(() => tile.classList.add('revealed'), i * 150));
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.2 });
        obs.observe(grid);
        return () => obs.disconnect();
    }, []);

    // Fade-up observer
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

            {/* PRODUCT HERO */}
            <section className="page-hero" id="product-hero">
                <div className="page-hero-inner">
                    <div className="page-hero-text fade-up">
                        <p className="label section-label"><span className="lime">◆</span> THE PLATFORM</p>
                        <h1 className="headline section-headline">EVERY CAPABILITY.<br />ONE PLATFORM.</h1>
                        <p className="page-hero-sub">Botza is modular, intelligent, and built for enterprise scale — from knowledge ingestion to governance.</p>
                    </div>
                    <div className="module-grid-wrap fade-up">
                        <div className="module-grid" id="module-grid">
                            {[
                                { id: 'mod-bot', dir: 'left', name: 'BOT BUILDER', desc: 'No-code builder for domain-specific bots' },
                                { id: 'mod-ingest', dir: 'top', name: 'KNOWLEDGE INGESTION', desc: 'Ingest any format — PDFs, CSVs, URLs' },
                                { id: 'mod-engine', dir: 'right', name: 'INTELLIGENCE ENGINE', desc: 'Domain-trained models with retrieval AI' },
                                { id: 'mod-assess', dir: 'bottom', name: 'ASSESSMENT & TRAINING', desc: 'Auto-generated quizzes and evaluations' },
                                { id: 'mod-analytics', dir: 'left', name: 'ANALYTICS', desc: 'Real-time dashboards and usage insights' },
                                { id: 'mod-govern', dir: 'right', name: 'GOVERNANCE', desc: 'Audit trails, compliance controls, RBAC' },
                            ].map(m => (
                                <div key={m.id} className="botza-card module-tile" data-dir={m.dir} id={m.id}>
                                    <div className="mod-icon">
                                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                                            <circle cx="18" cy="18" r="12" stroke="white" strokeWidth="1.5" />
                                            <circle cx="18" cy="18" r="4" stroke="#C8F000" strokeWidth="1.5" />
                                        </svg>
                                    </div>
                                    <h3 className="card-title mod-name">{m.name}</h3>
                                    <p className="body mod-desc">{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* DEEP DIVE — BOT BUILDER */}
            <section className="deepdive-section" id="dd-bot">
                <div className="dd-inner dd-left-text">
                    <div className="dd-text fade-up">
                        <span className="yellow-badge">01</span>
                        <h2 className="dd-headline">BOT BUILDER</h2>
                        <p className="dd-body">Configure domain-specific bots without a single line of code. Select channels, set guardrails, define tone, and preview conversations — all from one intuitive panel.</p>
                        <p className="dd-body">Supports multi-language, multi-team deployments with role-based access. Deploy in minutes, not weeks.</p>
                    </div>
                    <div className="dd-visual fade-up">
                        <div className="dd-schematic dd-bot-visual">
                            <div className="ddv-label">BOT CONFIG PANEL</div>
                            <div className="ddv-row">
                                <div className="ddv-cb ddv-cb-on">☑ WEB</div>
                                <div className="ddv-cb ddv-cb-on">☑ SLACK</div>
                                <div className="ddv-cb">☐ TEAMS</div>
                            </div>
                            <div className="ddv-divider" />
                            <div className="ddv-chat-preview">
                                <div className="ddv-chat-bubble ddv-user">How do I reset my password?</div>
                                <div className="ddv-chat-bubble ddv-bot">Navigate to Settings → Security → Reset. <span className="lime">✓</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEEP DIVE — KNOWLEDGE INGESTION */}
            <section className="deepdive-section dd-alt" id="dd-ingest">
                <div className="dd-inner dd-right-text">
                    <div className="dd-visual fade-up">
                        <div className="dd-schematic dd-ingest-visual">
                            <div className="ddv-file-icons">
                                {['PDF', 'CSV', 'DOCX', 'URL'].map(f => <div key={f} className="ddv-file"><span>{f}</span></div>)}
                            </div>
                            <svg className="ddv-arrows" viewBox="0 0 200 30">
                                {[25, 75, 125, 175].map(x => (
                                    <line key={x} x1={x} y1="0" x2="100" y2="28" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5" />
                                ))}
                            </svg>
                            <div className="ddv-kb-box">KNOWLEDGE BASE</div>
                        </div>
                    </div>
                    <div className="dd-text fade-up">
                        <span className="yellow-badge">02</span>
                        <h2 className="dd-headline">KNOWLEDGE INGESTION</h2>
                        <p className="dd-body">Upload documents, SOPs, FAQs, support tickets, or point to live URLs. Botza extracts, chunks, and embeds content into a structured vector knowledge base automatically.</p>
                        <p className="dd-body">Supports incremental updates — add new knowledge anytime without retraining from scratch.</p>
                    </div>
                </div>
            </section>

            {/* DEEP DIVE — INTELLIGENCE ENGINE */}
            <section className="deepdive-section" id="dd-engine">
                <div className="dd-inner dd-left-text">
                    <div className="dd-text fade-up">
                        <span className="yellow-badge">03</span>
                        <h2 className="dd-headline">INTELLIGENCE ENGINE</h2>
                        <p className="dd-body">The core of Botza. Combines retrieval-augmented generation with domain-specific models to produce accurate, source-cited responses.</p>
                        <p className="dd-body">Handles queries, assessments, and multi-turn conversations with context awareness and hallucination guards.</p>
                    </div>
                    <div className="dd-visual fade-up">
                        <div className="dd-schematic dd-engine-visual">
                            <div className="ddv-input-box">INPUT: "What is the refund policy?"</div>
                            <div className="ddv-process-box">DOMAIN MODEL</div>
                            <div className="ddv-output-box">
                                <p>"Refunds are processed within 7 business days..."</p>
                                <span className="ddv-source">SOURCE: REFUND_POLICY.PDF — P.3</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEEP DIVE — ASSESSMENT */}
            <section className="deepdive-section dd-alt" id="dd-assess">
                <div className="dd-inner dd-right-text">
                    <div className="dd-visual fade-up">
                        <div className="dd-schematic dd-assess-visual">
                            <div className="ddv-label">QUIZ — ONBOARDING POLICY</div>
                            <div className="ddv-quiz">
                                <p className="ddv-q">Q1: What is the probation period?</p>
                                <div className="ddv-option">A) 30 days</div>
                                <div className="ddv-option ddv-correct">B) 90 days <span className="lime">✓</span></div>
                                <div className="ddv-option">C) 60 days</div>
                            </div>
                        </div>
                    </div>
                    <div className="dd-text fade-up">
                        <span className="yellow-badge">04</span>
                        <h2 className="dd-headline">ASSESSMENT &amp; TRAINING</h2>
                        <p className="dd-body">Auto-generate quizzes, knowledge checks, and training assessments from your uploaded content. Perfect for onboarding, compliance certification, and continuous learning programs.</p>
                        <p className="dd-body">Supports multiple choice, short answer, and scenario-based questions with automated scoring.</p>
                    </div>
                </div>
            </section>

            {/* DEEP DIVE — ANALYTICS */}
            <section className="deepdive-section" id="dd-analytics">
                <div className="dd-inner dd-left-text">
                    <div className="dd-text fade-up">
                        <span className="yellow-badge">05</span>
                        <h2 className="dd-headline">ANALYTICS &amp; GOVERNANCE</h2>
                        <p className="dd-body">Full visibility into bot performance, query patterns, user adoption, and content gaps. Every AI interaction is logged with timestamps, source references, and confidence scores.</p>
                        <p className="dd-body">Role-based access control, data residency options, and compliance-first architecture built for regulated industries.</p>
                    </div>
                    <div className="dd-visual fade-up">
                        <div className="dd-schematic dd-analytics-visual">
                            <div className="ddv-label">ANALYTICS DASHBOARD</div>
                            <div className="ddv-bars">
                                {[['MON', 70], ['TUE', 90], ['WED', 100], ['THU', 65], ['FRI', 80]].map(([day, w]) => (
                                    <div key={day} className="ddv-bar-row">
                                        <span className="ddv-bar-label">{day}</span>
                                        <div className={`ddv-bar${day === 'WED' ? ' ddv-bar-lime' : ''}`} style={{ width: `${w}%` }} />
                                    </div>
                                ))}
                            </div>
                            <div className="ddv-divider" />
                            <div className="ddv-audit-rows">
                                <div className="ddv-audit">10:42 AM — Query resolved — POLICY_DOC.PDF</div>
                                <div className="ddv-audit">10:41 AM — Quiz submitted — Score: 4/5</div>
                                <div className="ddv-audit">10:39 AM — Ticket deflected — 0 agents</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BOTTOM CTA */}
            <section className="page-bottom-cta">
                <div className="section-rule" style={{ maxWidth: 1200, margin: '0 auto' }} />
                <div className="pbc-inner fade-up">
                    <h2 className="headline section-headline" style={{ textAlign: 'center' }}>READY TO DEPLOY?</h2>
                    <a href="mailto:tanisha@indikaai.com" className="btn-primary" id="product-cta-btn"><span>REQUEST DEMO</span></a>
                </div>
            </section>

            <Footer />
        </>
    );
}
