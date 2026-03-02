import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as helpdeskApi from '../services/helpdeskApi';

/* Fallback FAQs for Related section if API fails */
const FALLBACK_FAQS = [
    { id: 'f1', question: 'How do I change my subscription plan?', category: 'Billing' },
    { id: 'f2', question: 'Can I share my account with team members?', category: 'Account' },
    { id: 'f3', question: 'What payment methods are accepted?', category: 'Billing' },
];

export default function VideoDetail() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [related, setRelated] = useState([]);
    const [relatedLoad, setRelatedLoad] = useState(false);

    // Feedback state: null | 'up' | 'down'
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setError('');
        setFeedback(null);

        // 1. Fetch the Video
        helpdeskApi.getVideo(id)
            .then(res => {
                const data = res.data;
                if (!data) throw new Error('Video not found');
                setVideo(data);

                // 2. Fetch related FAQs (same category)
                setRelatedLoad(true);
                if (data.category) {
                    helpdeskApi.listFaqs({ category: data.category, limit: 5 })
                        .then(relRes => {
                            setRelated((relRes.data || []).slice(0, 3));
                        })
                        .catch(() => setRelated(FALLBACK_FAQS.slice(0, 3)))
                        .finally(() => setRelatedLoad(false));
                } else {
                    setRelatedLoad(false);
                }
            })
            .catch(err => {
                setError(err.message || 'Error loading video');
                setRelated(FALLBACK_FAQS);
            })
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            <Navbar />

            <section className="hd-hero" style={{ minHeight: '20vh', paddingBottom: 0 }}>
                <div className="section-inner" style={{ paddingTop: 100, paddingBottom: 20 }}>
                    <Link to="/helpdesk" className="hd-back-link">← BACK TO HELP CENTER</Link>

                    {loading ? (
                        <div className="hd-faq-skeleton" style={{ height: 40, marginTop: 20 }} />
                    ) : error ? (
                        <div className="hd-api-error">{error}</div>
                    ) : (
                        <>
                            {video?.category && <p className="label section-label"><span className="lime">◆</span> {video.category.toUpperCase()}</p>}
                            <h1 className="headline section-headline" style={{ fontSize: 'clamp(24px, 3vw, 42px)', marginBottom: 20, textTransform: 'none' }}>
                                {video?.title}
                            </h1>
                            <p className="body" style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 800 }}>
                                {video?.description}
                            </p>
                        </>
                    )}
                </div>
            </section>

            {!loading && !error && video && (
                <section className="hd-section hd-section-alt" style={{ paddingTop: 40 }}>
                    <div className="section-inner">

                        {/* THE VIDEO PLAYER */}
                        <div className="botza-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 40 }}>
                            {video.videoUrl ? (
                                <video
                                    controls
                                    autoPlay
                                    style={{ width: '100%', display: 'block', backgroundColor: '#000', maxHeight: '70vh' }}
                                    src={video.videoUrl}
                                    poster={video.thumbnailUrl}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '50vh', backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 64, color: 'var(--lime)', opacity: 0.8, marginBottom: 16 }}>▶</span>
                                    <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-headline)', letterSpacing: '0.04em' }}>VIDEO SOURCE UNAVAILABLE</p>
                                </div>
                            )}
                        </div>

                        <div className="hd-faq-content-box botza-card">

                            <h3 className="headline" style={{ fontSize: 20, marginBottom: 16 }}>Transcript / Summary</h3>
                            <div className="hd-faq-full-answer" style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
                                {video.transcriptText || video.summaryText || 'No transcript available for this video.'}
                            </div>

                            {/* FEEDBACK BUTTONS */}
                            <div className="hd-faq-feedback">
                                <p>Was this video helpful?</p>
                                <div className="hd-feedback-actions">
                                    <button
                                        className={`hd-feedback-btn ${feedback === 'up' ? 'active' : ''}`}
                                        onClick={() => setFeedback('up')}
                                        title="Thumbs Up"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                        </svg>
                                    </button>
                                    <button
                                        className={`hd-feedback-btn ${feedback === 'down' ? 'active down' : ''}`}
                                        onClick={() => setFeedback('down')}
                                        title="Thumbs Down"
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RELATED FAQS */}
                        {(relatedLoad || related.length > 0) && (
                            <div className="hd-related-faqs" style={{ marginTop: 80 }}>
                                <h3 className="headline" style={{ fontSize: 24, marginBottom: 24 }}>RELATED ARTICLES</h3>
                                {relatedLoad ? (
                                    <div className="hd-faq-list">
                                        {[1, 2, 3].map(i => <div key={i} className="hd-faq-skeleton" />)}
                                    </div>
                                ) : (
                                    <div className="hd-faq-list">
                                        {related.map(r => {
                                            const rId = r._id || r.id;
                                            return (
                                                <Link key={rId} to={`/faq/${rId}`} className="hd-related-item">
                                                    <div className="hd-related-header">
                                                        <span className="hd-related-q">{r.question || r.title}</span>
                                                        <span className="hd-related-arrow">→</span>
                                                    </div>
                                                    <div className="hd-related-answer">
                                                        {!r.answer && (r.answerText || r.description || 'No detailed answer provided.')}
                                                        {r.answer && <ReactMarkdown>{r.answer.substring(0, 150) + '...'}</ReactMarkdown>}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── CONTACT CTA ── */}
            <section className="hd-section">
                <div className="section-inner" style={{ textAlign: 'center' }}>
                    <p className="label section-label" style={{ justifyContent: 'center' }}><span className="lime">◆</span> STILL NEED HELP?</p>
                    <h2 className="headline section-headline" style={{ fontSize: 'clamp(28px, 3.5vw, 46px)' }}>OUR TEAM IS AVAILABLE 24/7</h2>
                    <div className="hd-contact-btns" style={{ marginTop: 40 }}>
                        <a href="mailto:tanisha@indikaai.com" className="btn-primary"><span>EMAIL SUPPORT</span></a>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
