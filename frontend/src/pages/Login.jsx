import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [reqStatus, setReqStatus] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('PLEASE ENTER YOUR EMAIL AND PASSWORD.'); return; }
        setLoading(true);
        try {
            const data = await api.login(email, password);
            login(data.token, data.user);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2200);
        } catch (err) {
            setError((err.message || 'LOGIN FAILED').toUpperCase());
        } finally {
            setLoading(false);
        }
    }

    async function handleRequestAccess(e) {
        e.preventDefault();
        if (!email) { setError('ENTER YOUR EMAIL ABOVE TO REQUEST ACCESS'); return; }
        try {
            await api.requestAccess(null, email);
            setReqStatus('✓ REQUEST SENT');
            setTimeout(() => setReqStatus(''), 3000);
        } catch {
            setError('NETWORK ERROR — PLEASE TRY AGAIN');
        }
    }

    return (
        <div className="login-page">
            {/* LEFT PANEL */}
            <div className="login-left">
                <div className="login-ghost-text" aria-hidden="true">BOTZA</div>
                <Link to="/" className="login-logo" aria-label="Botza Home">
                    <BrandLogo />
                </Link>
                <div className="login-schematic" aria-hidden="true">
                    <div className="ls-row ls-top">
                        <div className="ls-chip">📄 DOCS</div>
                        <div className="ls-chip">🎫 TICKETS</div>
                        <div className="ls-chip">📋 SOPs</div>
                    </div>
                    <svg className="ls-lines" viewBox="0 0 280 40" xmlns="http://www.w3.org/2000/svg">
                        <line x1="46" y1="0" x2="140" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                        <line x1="140" y1="0" x2="140" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                        <line x1="234" y1="0" x2="140" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                    </svg>
                    <div className="ls-node">BOTZA</div>
                    <svg className="ls-lines" viewBox="0 0 280 40" xmlns="http://www.w3.org/2000/svg">
                        <line x1="140" y1="0" x2="46" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                        <line x1="140" y1="0" x2="140" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                        <line x1="140" y1="0" x2="234" y2="38" stroke="#C8F000" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.3" />
                    </svg>
                    <div className="ls-row ls-bottom">
                        <div className="ls-out">✓ ANSWERS</div>
                        <div className="ls-out">□ QUIZZES</div>
                        <div className="ls-out">⇄ BOTS</div>
                    </div>
                </div>
                <p className="login-tagline"><em>Your enterprise knowledge. Activated.</em></p>
            </div>

            {/* RIGHT PANEL */}
            <div className="login-right">
                <div className="login-form-wrap">
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: '0.06em', color: '#C8F000', textTransform: 'uppercase', marginBottom: 12 }}>
                                ◆ ACCESS GRANTED
                            </p>
                            <p style={{ fontSize: 14, color: '#8A8FA8', fontFamily: "'Inter',sans-serif" }}>Redirecting to your workspace...</p>
                            <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.08)', marginTop: 32, overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#C8F000', animation: 'progressBar 2s ease-out forwards' }} />
                            </div>
                            <style>{`@keyframes progressBar{0%{width:0%}100%{width:100%}}`}</style>
                        </div>
                    ) : (
                        <>
                            <h1 className="login-heading">WELCOME BACK</h1>
                            <p className="login-sub-text">Sign in to your Botza workspace</p>

                            {error && (
                                <div style={{ background: 'rgba(255,60,60,0.12)', border: '1px solid rgba(255,60,60,0.35)', color: '#ff6b6b', fontFamily: 'Inter,sans-serif', fontSize: 13, letterSpacing: '0.05em', padding: '10px 14px', borderRadius: 4, marginBottom: 14, textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            <form className="login-form" onSubmit={handleLogin}>
                                <div className="field-group">
                                    <input type="email" className={`login-input${email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? ' field--error' : email ? ' field--valid' : ''}`}
                                        id="login-email" placeholder="WORK EMAIL" required autoComplete="email"
                                        value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
                                </div>
                                <div className="field-group field-password">
                                    <input type={showPw ? 'text' : 'password'} className={`login-input${password && password.length < 4 ? ' field--error' : password ? ' field--valid' : ''}`}
                                        id="login-password" placeholder="PASSWORD" required autoComplete="current-password"
                                        value={password} onChange={e => { setPassword(e.target.value); setError(''); }} />
                                    <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: showPw ? 1 : 0.5 }}>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </button>
                                </div>
                                <button type="submit" className="btn-primary btn-full" id="login-submit" disabled={loading}>
                                    {loading ? '· · ·' : 'SIGN IN'}
                                </button>
                                <p className="login-forgot"><a href="#">Forgot password?</a></p>
                            </form>

                            <div className="login-divider">
                                <span className="divider-line" /><span className="divider-text">OR</span><span className="divider-line" />
                            </div>

                            <button onClick={handleRequestAccess} className="btn-outline-lime btn-full" id="request-access-btn">
                                {reqStatus || 'REQUEST ACCESS'}
                            </button>

                            <p className="login-copyright">© 2025 Indika AI</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
