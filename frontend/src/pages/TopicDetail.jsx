import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as helpdeskApi from '../services/helpdeskApi';

/* Fallback FAQs if API fails */
const FALLBACK_FAQS = [
    { id: 'f1', question: 'How do I change my subscription plan?', category: 'Billing' },
    { id: 'f2', question: 'Can I share my account with team members?', category: 'Account' },
    { id: 'f3', question: 'What payment methods are accepted?', category: 'Billing' },
    { id: 'f4', question: 'How do I reset my password?', category: 'Sign-in/Login Issues' },
];

export default function TopicDetail() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [topicLoad, setTopicLoad] = useState(true);
    const [error, setError] = useState('');

    const [faqs, setFaqs] = useState([]);
    const [faqsLoad, setFaqsLoad] = useState(true);

    const [videos, setVideos] = useState([]);
    const [videosLoad, setVideosLoad] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTopicLoad(true);
        setFaqsLoad(true);
        setVideosLoad(true);
        setError('');

        // 1. Fetch the exact topic to get its title/description
        helpdeskApi.listTopics()
            .then(res => {
                const topicsList = res.data || [];
                const found = topicsList.find(t => t.id === topicId);
                if (!found) throw new Error('Topic not found');

                setTopic(found);
                setTopicLoad(false); // Fix: Clear topic load so UI renders

                const searchQuery = found.title;

                Promise.all([
                    helpdeskApi.listFaqs({ limit: 100 }), // Fetch all FAQs
                    helpdeskApi.listVideos({ limit: 100 }) // Fetch all Videos
                ])
                    .then(([faqRes, vidsRes]) => {
                        const allFaqs = faqRes.data || [];
                        const allVideos = vidsRes.data || [];

                        // Extract significant words from topic to match
                        const qWords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3 && w !== 'subscriptions');

                        const matchesTopic = (item) => {
                            const str = `${item.category || ''} ${item.title || item.question || ''} ${item.description || item.answerText || ''}`.toLowerCase();
                            return qWords.some(w => str.includes(w));
                        };

                        const matchedFaqs = allFaqs.filter(matchesTopic);
                        const matchedVideos = allVideos.filter(matchesTopic);

                        setFaqs(matchedFaqs.length > 0 ? matchedFaqs : FALLBACK_FAQS);
                        setVideos(matchedVideos.length > 0 ? matchedVideos : allVideos);
                    })
                    .catch(() => {
                        setFaqs(FALLBACK_FAQS);
                        setVideos([]);
                    })
                    .finally(() => {
                        setFaqsLoad(false);
                        setVideosLoad(false);
                    });

            })
            .catch(err => {
                setError(err.message || 'Error loading topic');
                setTopicLoad(false);
                setFaqsLoad(false);
                setVideosLoad(false);
            });
    }, [topicId]);

    // Group FAQs by category for UI display
    const groupedFaqs = faqs.reduce((acc, faq) => {
        const cat = faq.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(faq);
        return acc;
    }, {});

    return (
        <>
            <Navbar />

            <section className="hd-hero" style={{ minHeight: '20vh', paddingBottom: 0 }}>
                <div className="section-inner" style={{ paddingTop: 100, paddingBottom: 20 }}>
                    <Link to="/helpdesk" className="hd-back-link">← BACK TO HELP CENTER</Link>

                    {topicLoad ? (
                        <div className="hd-faq-skeleton" style={{ height: 40, marginTop: 20 }} />
                    ) : error ? (
                        <div className="hd-api-error">{error}</div>
                    ) : (
                        <>
                            <p className="label section-label"><span className="lime">◆</span> TOPIC GUIDE</p>
                            <h1 className="headline section-headline" style={{ fontSize: 'clamp(24px, 3vw, 42px)', marginBottom: 20, textTransform: 'none' }}>
                                {topic?.title}
                            </h1>
                            <p className="body" style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 800 }}>
                                {topic?.description}
                            </p>
                        </>
                    )}
                </div>
            </section>

            {!topicLoad && !error && topic && (
                <section className="hd-section hd-section-alt" style={{ paddingTop: 40 }}>
                    <div className="section-inner">

                        {/* VIDEOS FOR THIS TOPIC */}
                        {(videosLoad || videos.length > 0) && (
                            <div style={{ marginBottom: 60 }}>
                                <h3 className="headline" style={{ fontSize: 24, marginBottom: 24 }}>VIDEO GUIDES</h3>
                                {videosLoad ? (
                                    <div className="hd-loading-row">
                                        {[1, 2].map(i => <div key={i} className="hd-topic-card-skeleton" />)}
                                    </div>
                                ) : (
                                    <div className="hd-topics-grid fade-up" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                        {videos.map(v => {
                                            const vId = v._id || v.id;
                                            return (
                                                <div key={vId} className="botza-card hd-topic-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/video/${vId}`)}>
                                                    <div style={{ background: '#111', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                        <span style={{ fontSize: 40, color: 'var(--lime)', opacity: 0.8 }}>▶</span>
                                                        <span className="hd-video-badge">{Math.floor(v.durationSeconds / 60)}:{String(v.durationSeconds % 60).padStart(2, '0')}</span>
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
                                )}
                            </div>
                        )}

                        {/* FAQS FOR THIS TOPIC */}
                        {(faqsLoad || faqs.length > 0) && (
                            <div className="hd-related-faqs" style={{ marginTop: 40 }}>
                                <h3 className="headline" style={{ fontSize: 24, marginBottom: 24 }}>FREQUENTLY ASKED QUESTIONS</h3>
                                {faqsLoad ? (
                                    <div className="hd-faq-list">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="hd-faq-skeleton" />)}
                                    </div>
                                ) : (
                                    <div className="hd-grouped-faqs">
                                        {Object.entries(groupedFaqs).map(([cat, catFaqs]) => (
                                            <div key={cat} style={{ marginBottom: 40 }}>
                                                <h4 className="label" style={{ color: 'var(--lime)', marginBottom: 16, letterSpacing: '0.08em', fontSize: 14 }}>
                                                    <span style={{ opacity: 0.5 }}>◆</span> {cat.toUpperCase()} CATEGORY
                                                </h4>
                                                <div className="hd-faq-list">
                                                    {catFaqs.map(r => {
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
                                        ))}
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
