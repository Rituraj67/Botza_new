import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as helpdeskApi from '../services/helpdeskApi';

export default function CategoryDetail() {
    const { categoryName } = useParams();
    const navigate = useNavigate();

    // Decode the URL param to a readable string
    const decodedCategory = decodeURIComponent(categoryName);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [faqs, setFaqs] = useState([]);
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);
        setError('');

        // Fetch FAQs and Videos that match the specific category from live API
        Promise.all([
            helpdeskApi.listFaqs({ category: decodedCategory, limit: 100 }),
            helpdeskApi.listVideos({ category: decodedCategory, limit: 100 })
        ])
            .then(([faqRes, vidsRes]) => {
                setFaqs(faqRes.data || []);
                setVideos(vidsRes.data || []);
            })
            .catch(err => {
                setError(err.message || 'Error loading category content');
            })
            .finally(() => {
                setLoading(false);
            });

    }, [decodedCategory]);

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
                            <p className="label section-label"><span className="lime">◆</span> EXPLORE CATEGORY</p>
                            <h1 className="headline section-headline" style={{ fontSize: 'clamp(24px, 3vw, 42px)', marginBottom: 20, textTransform: 'none' }}>
                                {decodedCategory}
                            </h1>
                        </>
                    )}
                </div>
            </section>

            {!loading && !error && (
                <section className="hd-section hd-section-alt" style={{ paddingTop: 40 }}>
                    <div className="section-inner">

                        {/* VIDEOS IN THIS CATEGORY */}
                        {(videos.length > 0) && (
                            <div style={{ marginBottom: 60 }}>
                                <h3 className="headline" style={{ fontSize: 24, marginBottom: 24 }}>VIDEO GUIDES</h3>
                                <div className="hd-topics-grid fade-up" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                    {videos.map(v => {
                                        const vId = v._id || v.id;
                                        return (
                                            <div key={vId} className="botza-card hd-topic-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/video/${vId}`)}>
                                                <div style={{ background: '#111', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    {v.thumbnailUrl ? (
                                                        <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                                                    ) : (
                                                        <span style={{ fontSize: 40, color: 'var(--lime)', opacity: 0.8 }}>▶</span>
                                                    )}
                                                    <span className="hd-video-badge" style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>
                                                        {Math.floor((v.durationSeconds || 0) / 60)}:{String((v.durationSeconds || 0) % 60).padStart(2, '0')}
                                                    </span>
                                                </div>
                                                <div className="hd-video-info" style={{ padding: '20px 24px' }}>
                                                    <h3 className="card-title" style={{ fontSize: 16, marginBottom: 8, color: 'var(--white)' }}>{v.title}</h3>
                                                    <p className="body" style={{ fontSize: 13, marginBottom: 12, color: 'var(--muted)' }}>{v.description}</p>
                                                    <span style={{ fontSize: 11, color: 'var(--lime)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v.category}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* FAQS IN THIS CATEGORY */}
                        {(faqs.length > 0) && (
                            <div className="hd-related-faqs" style={{ marginTop: videos.length > 0 ? 40 : 0 }}>
                                <h3 className="headline" style={{ fontSize: 24, marginBottom: 24 }}>FREQUENTLY ASKED QUESTIONS</h3>
                                <div className="hd-faq-list">
                                    {faqs.map(r => {
                                        const rId = r._id || r.id;
                                        return (
                                            <Link key={rId} to={`/faq/${rId}`} className="hd-related-item">
                                                <div className="hd-related-header">
                                                    <span className="hd-related-q">{r.title || r.question}</span>
                                                    <span className="hd-related-arrow">→</span>
                                                </div>
                                                <div className="hd-related-answer">
                                                    {!r.answer && (r.snippet || r.answerText || r.description || 'No detailed answer provided.')}
                                                    {r.answer && <ReactMarkdown>{r.answer.substring(0, 150) + '...'}</ReactMarkdown>}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(videos.length === 0 && faqs.length === 0) && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                                <span style={{ fontSize: 40, opacity: 0.5, display: 'block', marginBottom: 20 }}>📁</span>
                                <p>No articles or videos found in this category.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

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
