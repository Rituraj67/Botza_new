import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer() {
    return (
        <footer className="footer" id="footer">
            <div className="footer-inner">
                <div className="footer-brand" id="footer-brand">
                    <BrandLogo variant="footer" />
                </div>
                <div className="footer-right">
                    <nav className="footer-nav" aria-label="Footer navigation">
                        <Link to="/product" className="footer-link lime">PRODUCT</Link>
                        <Link to="/#usecases" className="footer-link">USE CASES</Link>
                        <Link to="/#how-it-works" className="footer-link">HOW IT WORKS</Link>
                        <Link to="/about" className="footer-link">ABOUT</Link>
                        <Link to="/login" className="footer-link">LOGIN</Link>
                    </nav>
                    <div className="footer-legal-links">
                        <a href="#" className="footer-legal">Privacy Statement</a>
                        <a href="#" className="footer-legal">Terms of Use</a>
                        <a href="#" className="footer-legal">Documentation</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p className="footer-copy">© 2025 INDIKA AI. ALL RIGHTS RESERVED.</p>
            </div>
        </footer>
    );
}
