import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as helpdeskApi from '../services/helpdeskApi';

/* ── Fallback FAQs shown when API is unavailable ─────────── */
const FALLBACK_FAQS = [
    {
        id: 'f1', question: 'How do I change my subscription plan?',
        answerText: 'You can change your plan at any time in the Billing section of your account settings. Pro-rated charges will apply automatically. Changes take effect at the start of the next billing cycle.'
    },
    {
        id: 'f2', question: 'Can I share my account with team members?',
        answerText: 'Yes — Botza supports multi-user workspaces with role-based access control. Contact your account manager to provision additional seats.'
    },
    {
        id: 'f3', question: 'What payment methods are accepted?',
        answerText: 'We accept all major credit cards, bank transfers, and enterprise invoicing on NET-30 terms for qualifying contracts.'
    },
    {
        id: 'f4', question: 'How do I reset my password?',
        answerText: "On the login page, click \"Forgot password?\" and enter your work email. You'll receive a secure reset link within 60 seconds."
    },
    {
        id: 'f5', question: 'Is my data secure and compliant?',
        answerText: 'All data is encrypted at rest and in transit (AES-256 / TLS 1.3). Botza is SOC 2 Type II certified and supports GDPR and HIPAA compliance configurations.'
    },
];

/* ── Fallback icons for topics when API doesn't provide one ── */
const ICON_MAP = {
    account: '◉',
    billing: '◈',
    technical: '⊛',
    security: '◆',
    'getting started': '▷',
    general: '◇',
    usage: '◎',
    default: '◆',
};

function topicIcon(name = '') {
    const key = name.toLowerCase();
    for (const [k, v] of Object.entries(ICON_MAP)) {
        if (key.includes(k)) return v;
    }
    return ICON_MAP.default;
}

/* ── Debounce hook ────────────────────────────────────────── */
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* ── FAQ list item (Links to detail page) ─────────────────── */
function FaqItem({ faq }) {
    const faqId = faq._id || faq.id;
    return (
        <Link to={`/faq/${faqId}`} className="hd-faq-item" style={{ textDecoration: 'none', display: 'block' }}>
            <div className="hd-faq-btn" style={{ cursor: 'pointer' }}>
                <span className="hd-faq-q">{faq.question || faq.title}</span>
                <span className="hd-faq-icon">→</span>
            </div>
            <div className="hd-faq-answer-hover">
                {!faq.answer && (faq.answerText || faq.description || 'No detailed answer provided.')}
                {faq.answer && <ReactMarkdown>{faq.answer.substring(0, 180) + '...'}</ReactMarkdown>}
            </div>
        </Link>
    );
}


/* ── Text Highlighter ─────────────────────────────────────── */
function HighlightText({ text = '', highlight = '' }) {
    if (!highlight.trim()) return <>{text}</>;
    // Case-insensitive regex split, preserving the match
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <span key={i} className="hd-sr-highlight">{part}</span> : part
            )}
        </>
    );
}

/* ── Search result item ───────────────────────────────────── */
function SearchResultItem({ result, onSelect, query }) {
    const cleanSnippet = result.snippet ? result.snippet.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : '';
    return (
        <div className="hd-search-result" onClick={() => onSelect && onSelect(result)}>
            <span className="hd-sr-type">{result.type === 'faq' ? 'FAQ' : 'VIDEO'}</span>
            <span className="hd-sr-title"><HighlightText text={result.title} highlight={query} /></span>
            {cleanSnippet && <p className="hd-sr-snippet"><HighlightText text={cleanSnippet} highlight={query} /></p>}
            {result.category && <span className="hd-sr-cat">{result.category}</span>}
        </div>
    );
}



/* ── Small spinner ────────────────────────────────────────── */
function Spinner() {
    return <span className="hd-spinner">· · ·</span>;
}

export default function Helpdesk() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searchRes, setSearchRes] = useState(null);
    const [searching, setSearching] = useState(false);
    const [searchErr, setSearchErr] = useState('');
    const [topics, setTopics] = useState([]);
    const [topicsLoad, setTopicsLoad] = useState(true);
    const [activeCateg, setActiveCateg] = useState(null);
    const [faqs, setFaqs] = useState(FALLBACK_FAQS); // start with fallback
    const [faqsLoad, setFaqsLoad] = useState(true);
    const [faqsErr, setFaqsErr] = useState('');
    const [faqsApiDown, setFaqsApiDown] = useState(false);  // true → showing fallback

    const [videos, setVideos] = useState([]);
    const [videosLoad, setVideosLoad] = useState(true);
    const [videosErr, setVideosErr] = useState('');

    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);


    const debouncedSearch = useDebounce(search, 450);

    /* ── Add Chatbot Widget ───────────────────────────────────── */
    useEffect(() => {
        (function (w, d, s, o, f, js, fjs) {
            w['BotzaHelpChatWidget'] = o; w[o] = w[o] || function () { (w[o].q = w[o].q || []).push(arguments) };
            if (d.getElementById(o)) return; // Prevent duplicate injection
            js = d.createElement(s);
            fjs = d.getElementsByTagName(s)[0];
            js.id = o; js.src = f; js.async = 1;
            if (fjs && fjs.parentNode) fjs.parentNode.insertBefore(js, fjs);
            else d.head.appendChild(js);
        }(window, document, 'script', 'botzaHelpChat', 'http://localhost:5050/helpchat-widget.js'));

        window.botzaHelpChat('init', {
            helpDeskSlug: 'tets',              // or whatever your actual slug is
            apiToken: helpdeskApi.API_TOKEN    // must be set in .env
          });

        return () => {
            if (typeof window.botzaHelpChat === 'function') {
                window.botzaHelpChat('destroy');
            }
            const popup = document.getElementById('botza-chat-widget-root');
            if (popup) popup.remove();
            const btn = document.getElementById('botza-chat-trigger-btn');
            if (btn) btn.remove();
            const script = document.getElementById('botzaHelpChat');
            if (script) script.remove();
        };
    }, []);

    /* Fade-up observer */
    useEffect(() => {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [faqs, topics, searchRes]);

    /* ── Load topics & videos on mount ────────────────────── */
    useEffect(() => {
        setTopicsLoad(true);
        setVideosLoad(true);

        Promise.all([
            helpdeskApi.listTopics(),
            helpdeskApi.listVideos({ limit: 4 })
        ])
            .then(([topicsRes, vidsRes]) => {
                setTopics(topicsRes.data || []);
                setVideos(vidsRes.data || []);
            })
            .catch((err) => {
                setVideosErr(err.message || 'Error loading videos');
                /* silently fall back to empty — FAQs still load below */
            })
            .finally(() => {
                setTopicsLoad(false);
                setVideosLoad(false);
            });
    }, []);

    /* ── Load FAQs when page or category changes ──────────────── */
    useEffect(() => {
        if (debouncedSearch) return;
        setFaqsLoad(true);
        setFaqsErr('');
        helpdeskApi.listFaqs({ page, limit: 10, ...(activeCateg ? { category: activeCateg } : {}) })
            .then(res => {
                const data = res.data || [];
                if (data.length > 0) {
                    setFaqs(data);
                    setFaqsApiDown(false);
                } else {
                    // API returned zero items — keep showing fallback
                    setFaqs(FALLBACK_FAQS);
                    setFaqsApiDown(true);
                }
                setPagination(res.pagination || null);
            })
            .catch(err => {
                // API unreachable — show fallback + subtle error
                setFaqsErr(err.message || 'Could not reach the FAQ server.');
                setFaqs(FALLBACK_FAQS);
                setFaqsApiDown(true);
            })
            .finally(() => setFaqsLoad(false));
    }, [page, activeCateg, debouncedSearch]);

    /* ── Search when debounced query changes ──────────────────── */
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setSearchRes(null);
            setSearchErr('');
            return;
        }
        setSearching(true);
        setSearchErr('');
        helpdeskApi.searchFaqs({ query: debouncedSearch, limit: 12, autosuggest: true, semantic: true })
            .then(res => setSearchRes(res.data || {}))
            .catch(err => {
                setSearchErr(err.message || 'Search failed. Please try again.');
                setSearchRes(null);
            })
            .finally(() => setSearching(false));
    }, [debouncedSearch]);

    /* Category click — go to category detail page */
    const handleCateg = (cat) => {
        if (!cat) return;
        navigate(`/category/${encodeURIComponent(cat)}`);
    };

    /* Search result click — go to detail page */
    const handleResultSelect = useCallback((result) => {
        if (result.type === 'faq') {
            navigate(`/faq/${result.id}`);
        } else if (result.type === 'video') {
            navigate(`/video/${result.id}`);
        }
    }, [navigate]);

    /* Token missing warning */
    const noToken = !helpdeskApi.API_TOKEN;

    return (
        <>
            <Navbar />

            {/* ── No token warning ──────────────────────────────── */}
            {noToken && (
                <div style={{ background: 'rgba(255,200,0,0.12)', border: '1px solid rgba(255,200,0,0.3)', color: '#FFD700', fontFamily: 'Inter,sans-serif', fontSize: 12, letterSpacing: '0.06em', padding: '10px 40px', textAlign: 'center', marginTop: 66 }}>
                    ⚠ VITE_HELPDESK_API_TOKEN not set — API calls will fail. Add it to <code>frontend/.env</code>
                </div>
            )}

            {/* ── HERO ──────────────────────────────────────────── */}
            <section className="hd-hero">
                <div className="section-inner" style={{ paddingTop: noToken ? 40 : 100, paddingBottom: 60 }}>
                    <p className="label section-label fade-up"><span className="lime">◆</span> HELP CENTER</p>
                    <h1 className="headline section-headline fade-up">
                        HOW CAN WE<br /><span className="lime">HELP YOU?</span>
                    </h1>
                    <p className="body fade-up" style={{ maxWidth: 460, marginBottom: 40 }}>
                        Search our knowledge base, browse categories, or explore popular topics below.
                    </p>

                    {/* ── Search box ─────────────────────────────────── */}
                    <div className="hd-search-wrap fade-up">
                        <div className="hd-search-box">
                            <span className="hd-search-icon">⌕</span>
                            <input
                                type="text"
                                className="hd-search-input"
                                placeholder="SEARCH KNOWLEDGE BASE..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoComplete="off"
                            />
                            {searching && <Spinner />}
                            {search && !searching && (
                                <button className="hd-search-clear" onClick={() => { setSearch(''); setSearchRes(null); }} aria-label="Clear">×</button>
                            )}
                        </div>

                        {/* ── Search results dropdown ──────────────────── */}
                        {(searchRes || searchErr) && search && (
                            <div className="hd-search-dropdown">
                                {searchErr && (
                                    <div className="hd-search-error">{searchErr}</div>
                                )}
                                {searchRes && searchRes.results?.length === 0 && (
                                    <div className="hd-search-empty">No results found for "<strong>{search}</strong>"</div>
                                )}
                                {searchRes?.results?.map(r => (
                                    <SearchResultItem key={r.id} result={r} onSelect={handleResultSelect} query={search} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Dynamic Categories removed ── */}
                </div>
            </section>

            {/* ── TOPICS ────────────────────────────────────────── */}
            {
                (topicsLoad || topics.length > 0) && (
                    <section className="hd-section" id="hd-topics">
                        <div className="section-inner">
                            <p className="label section-label fade-up"><span className="lime">◆</span> POPULAR TOPICS</p>
                            <h2 className="headline section-headline fade-up" style={{ fontSize: 'clamp(28px,3.5vw,46px)' }}>BROWSE BY TOPIC</h2>

                            {topicsLoad ? (
                                <div className="hd-loading-row">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="hd-topic-card-skeleton" />)}
                                </div>
                            ) : (
                                <div className="hd-topics-grid fade-up">
                                    {topics.map((t) => (
                                        <div
                                            key={t.id}
                                            className="botza-card hd-topic-card"
                                            onClick={() => navigate(`/topic/${t.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="hd-topic-icon" style={t.iconColor ? { color: t.iconColor } : {}}>
                                                {topicIcon(t.title)}
                                            </div>
                                            <h3 className="card-title hd-topic-label">{t.title}</h3>
                                            {t.description && <p className="body hd-topic-desc">{t.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )
            }

            {/* ── VIDEOS ────────────────────────────────────────── */}
            {
                (videosLoad || videos.length > 0 || videosErr) && (
                    <section className="hd-section hd-section-alt" id="hd-videos">
                        <div className="section-inner">
                            <p className="label section-label fade-up"><span className="lime">◆</span> VIDEO GUIDES</p>
                            <h2 className="headline section-headline fade-up" style={{ fontSize: 'clamp(28px,3.5vw,46px)' }}>WATCH & LEARN</h2>

                            {videosErr && <div className="hd-api-error">{videosErr}</div>}

                            {videosLoad ? (
                                <div className="hd-loading-row">
                                    {[1, 2, 3].map(i => <div key={i} className="hd-topic-card-skeleton" />)}
                                </div>
                            ) : (
                                <div className="hd-topics-grid fade-up" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                    {videos.map(v => (
                                        <div key={v.id} className="botza-card hd-topic-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/video/${v.id}`)}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    minHeight: 160,
                                                    height: 160,
                                                    position: 'relative',
                                                    backgroundColor: '#111',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {v.thumbnailUrl ? (
                                                    <img
                                                        src={v.thumbnailUrl}
                                                        alt=""
                                                        style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                        }}
                                                    />
                                                ) : null}
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                    <span style={{ fontSize: 40, color: 'var(--lime)', opacity: 0.9, textShadow: '0 0 8px rgba(0,0,0,0.8)' }}>▶</span>
                                                </div>
                                                {v.durationSeconds != null && (
                                                    <span className="hd-video-badge">
                                                        {Math.floor(v.durationSeconds / 60)}:{String(v.durationSeconds % 60).padStart(2, '0')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hd-video-info" style={{ padding: '20px 24px' }}>
                                                <h3 className="card-title" style={{ fontSize: 16, marginBottom: 8, color: 'var(--white)' }}>{v.title}</h3>
                                                <p className="body" style={{ fontSize: 13, marginBottom: 12, color: 'var(--muted)' }}>{v.description}</p>
                                                <span style={{ fontSize: 11, color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v.category}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )
            }

            {/* ── FAQs ──────────────────────────────────────────── */}
            <section className="hd-section hd-section-alt" id="hd-faq">
                <div className="section-inner">
                    <p className="label section-label fade-up"><span className="lime">◆</span> FAQ</p>
                    <h2 className="headline section-headline fade-up" style={{ fontSize: 'clamp(28px,3.5vw,46px)', marginBottom: 8 }}>
                        {activeCateg ? activeCateg.toUpperCase() : 'FREQUENTLY ASKED'}
                    </h2>                    {/* ── Optional ALL CATEGORIES BUTTON removed because pills directly navigate now ── */}

                    {faqsErr && (
                        <div className="hd-api-error fade-up">{faqsErr}</div>
                    )}

                    {faqsLoad ? (
                        <div className="hd-faq-list fade-up">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="hd-faq-skeleton" />)}
                        </div>
                    ) : (
                        <>
                            {/* Subtle note when showing fallback content */}
                            {faqsApiDown && (
                                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 8, marginBottom: 16, opacity: 0.7 }}>
                                    ◇ Showing default FAQs — live data unavailable
                                </div>
                            )}
                            <div className="hd-faq-list fade-up" style={{ marginTop: faqsApiDown ? 0 : 32 }}>
                                {faqs.map(f => <FaqItem key={f._id || f.id} faq={f} />)}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && !faqsLoad && (
                        <div className="hd-pagination fade-up">
                            <button className="hd-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← PREV</button>
                            <span className="hd-page-info">{page} / {pagination.totalPages}</span>
                            <button className="hd-page-btn" disabled={!pagination.hasMore} onClick={() => setPage(p => p + 1)}>NEXT →</button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── CONTACT CTA ───────────────────────────────────── */}
            <section className="hd-section" id="hd-contact">
                <div className="section-inner" style={{ textAlign: 'center' }}>
                    <div className="section-rule" style={{ maxWidth: 1200, margin: '0 auto 60px' }} />
                    <p className="label section-label fade-up" style={{ justifyContent: 'center' }}><span className="lime">◆</span> STILL NEED HELP?</p>
                    <h2 className="headline section-headline fade-up" style={{ fontSize: 'clamp(28px,3.5vw,46px)' }}>OUR TEAM IS AVAILABLE 24/7</h2>
                    <p className="body fade-up" style={{ maxWidth: 440, margin: '0 auto 40px' }}>
                        Can't find what you're looking for? Our support team is ready to assist.
                    </p>
                    <div className="hd-contact-btns fade-up">
                        <a href="mailto:tanisha@indikaai.com" className="btn-primary"><span>EMAIL SUPPORT</span></a>
                        <Link to="/" className="btn-outline-lime">BACK TO HOME</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
