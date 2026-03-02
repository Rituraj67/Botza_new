export default function BrandLogo({ size = 40, variant = 'nav' }) {
    if (variant === 'footer') {
        return (
            <svg viewBox="0 0 120 70" height="70" className="brand-logo-v3" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(46, 0)">
                    <rect x="0" y="0" width="7" height="28" fill="#C8F000" />
                    <rect x="7" y="0" width="14" height="12" fill="none" stroke="#C8F000" strokeWidth="2" />
                    <line x1="11" y1="4" x2="17" y2="4" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                    <line x1="11" y1="6" x2="17" y2="6" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                    <line x1="11" y1="8" x2="15" y2="8" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                    <rect x="7" y="14" width="18" height="14" fill="none" stroke="#C8F000" strokeWidth="2" />
                    <polyline points="13,18 17,21 13,24" fill="none" stroke="#C8F000" strokeWidth="1.5" />
                </g>
                <g fontFamily="'Barlow Condensed', sans-serif" fontWeight="800" fontSize="22" fill="#FFFFFF" letterSpacing="0.08em">
                    <text x="32" y="46">B</text>
                    <text x="44" y="46">O</text>
                    <text x="58" y="46">TZA</text>
                </g>
                <circle cx="49" cy="38.5" r="6" fill="none" stroke="#C8F000" strokeWidth="1.5" />
                <text x="60" y="62" fontFamily="'Inter', sans-serif" fontWeight="400" fontSize="7" fill="#8A8FA8" letterSpacing="0.15em" textAnchor="middle">BY INDIKA AI</text>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 160 40" height={size} className="brand-logo-v1" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0, 6)">
                <rect x="0" y="0" width="7" height="28" fill="#C8F000" />
                <rect x="7" y="0" width="14" height="12" fill="none" stroke="#C8F000" strokeWidth="2" />
                <line x1="11" y1="4" x2="17" y2="4" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                <line x1="11" y1="6" x2="17" y2="6" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                <line x1="11" y1="8" x2="15" y2="8" stroke="rgba(196,240,0,0.5)" strokeWidth="1" />
                <rect x="7" y="14" width="18" height="14" fill="none" stroke="#C8F000" strokeWidth="2" />
                <polyline points="13,18 17,21 13,24" fill="none" stroke="#C8F000" strokeWidth="1.5" />
            </g>
            <g fontFamily="'Barlow Condensed', sans-serif" fontWeight="800" fontSize="28" fill="#FFFFFF" letterSpacing="0.08em">
                <text x="36" y="24">B</text>
                <text x="50" y="24">O</text>
                <text x="68" y="24">TZA</text>
            </g>
            <circle cx="56.5" cy="14" r="8" fill="none" stroke="#C8F000" strokeWidth="1.5" />
            <text x="36" y="35" fontFamily="'Inter', sans-serif" fontWeight="400" fontSize="8" fill="#8A8FA8" letterSpacing="0.15em">BY INDIKA AI</text>
        </svg>
    );
}
