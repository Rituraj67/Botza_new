import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setMenuOpen(false); }, [location]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
            <div className="nav-inner">
                <Link to="/" className="nav-logo" aria-label="Botza Home">
                    <BrandLogo />
                </Link>

                <ul className={`nav-links${menuOpen ? ' open' : ''}`} id="nav-links">
                    <li><Link to="/product" className={`nav-link${isActive('/product') ? ' active' : ''}`}>PRODUCT</Link></li>
                    <li><Link to="/#usecases" className="nav-link" onClick={() => setMenuOpen(false)}>USE CASES</Link></li>
                    <li><Link to="/#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>HOW IT WORKS</Link></li>
                    <li><Link to="/about" className={`nav-link${isActive('/about') ? ' active' : ''}`}>ABOUT</Link></li>
                    <li><Link to="/helpdesk" className={`nav-link${isActive('/helpdesk') ? ' active' : ''}`}>HELP</Link></li>
                </ul>

                <div className="nav-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="nav-login" style={{ color: 'var(--lime)', fontSize: 12 }}>
                                {user?.email}
                            </span>
                            <button
                                onClick={logout}
                                className="nav-login"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-login">LOGIN</Link>
                    )}
                    <Link to="/#cta" className="btn-primary" id="nav-demo-btn"><span>REQUEST DEMO</span></Link>
                </div>

                <button
                    className={`hamburger${menuOpen ? ' open' : ''}`}
                    id="hamburger"
                    aria-label="Open menu"
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    );
}
