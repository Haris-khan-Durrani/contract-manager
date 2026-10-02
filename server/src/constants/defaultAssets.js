/**
 * defaultAssets.js — Default Corporate Assets for 360 Global Immigration
 *
 * Provides high-fidelity, transparent vector SVGs for:
 * 1. Official Corporate Seal / Company Stamp (circular legal seal)
 * 2. Authorized Agent / Company Signature (cursive ink signature)
 * 3. Official 360GI Logo
 */

const DEFAULT_360GI_LOGO = 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png';

// High-fidelity Official Circular Corporate Seal (Navy #15325b & Gold #c59b27, transparent background)
const stampSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <path id="stamp-arc-top" d="M 32,120 A 88,88 0 1,1 208,120" fill="none" />
    <path id="stamp-arc-bottom" d="M 208,120 A 88,88 0 1,1 32,120" fill="none" />
    <filter id="stamp-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#15325b" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Outer Double Rings -->
  <circle cx="120" cy="120" r="112" fill="none" stroke="#15325b" stroke-width="3.5" opacity="0.92"/>
  <circle cx="120" cy="120" r="105" fill="none" stroke="#15325b" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.85"/>
  <circle cx="120" cy="120" r="82" fill="none" stroke="#15325b" stroke-width="2" opacity="0.88"/>
  <circle cx="120" cy="120" r="77" fill="none" stroke="#15325b" stroke-width="1" stroke-dasharray="2,2" opacity="0.75"/>

  <!-- Top Arc Text -->
  <text fill="#15325b" font-family="'Cinzel', 'Trajan Pro', Georgia, serif" font-size="11.5" font-weight="700" letter-spacing="2.2" opacity="0.95">
    <textPath href="#stamp-arc-top" startOffset="50%" text-anchor="middle">
      ★ 360 GLOBAL IMMIGRATION ★
    </textPath>
  </text>

  <!-- Bottom Arc Text -->
  <text fill="#15325b" font-family="'Cinzel', 'Trajan Pro', Georgia, serif" font-size="9.5" font-weight="700" letter-spacing="1.8" opacity="0.92">
    <textPath href="#stamp-arc-bottom" startOffset="50%" text-anchor="middle">
      OFFICIAL CORPORATE SEAL
    </textPath>
  </text>

  <!-- Center Emblem -->
  <!-- 3 Pillars graphic -->
  <g transform="translate(120, 116)" fill="#15325b" opacity="0.92">
    <!-- Star at top -->
    <path d="M 0,-34 L 2.5,-26 L 10,-26 L 4,-21 L 6,-14 L 0,-18 L -6,-14 L -4,-21 L -10,-26 L -2.5,-26 Z" fill="#c59b27" />
    
    <!-- Left Pillar -->
    <rect x="-24" y="-10" width="10" height="26" rx="2" fill="#15325b" />
    <rect x="-26" y="-12" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="-26" y="16" width="14" height="3" rx="1" fill="#c59b27" />

    <!-- Center Pillar -->
    <rect x="-5" y="-14" width="10" height="30" rx="2" fill="#15325b" />
    <rect x="-7" y="-16" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="-7" y="16" width="14" height="3" rx="1" fill="#c59b27" />

    <!-- Right Pillar -->
    <rect x="14" y="-10" width="10" height="26" rx="2" fill="#15325b" />
    <rect x="12" y="-12" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="12" y="16" width="14" height="3" rx="1" fill="#c59b27" />

    <!-- Center Badge Ribbon -->
    <rect x="-42" y="22" width="84" height="15" rx="3" fill="#15325b" />
    <text x="0" y="33" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="8" font-weight="bold" letter-spacing="1.2">
      DUBAI · CYPRUS
    </text>
  </g>
</svg>
`.trim();

const DEFAULT_COMPANY_STAMP = `data:image/svg+xml;utf8,${encodeURIComponent(stampSvg)}`;

// High-fidelity Authorized Officer Cursive Signature (Deep Indigo Ink #1e295b, transparent background)
const signatureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110">
  <g fill="none" stroke="#162a56" stroke-linecap="round" stroke-linejoin="round">
    <!-- Cursive name flourish "H. Durrani" -->
    <path d="M 28,68 C 30,35 48,15 62,38 C 70,52 64,82 54,84 C 42,86 38,58 52,48 C 66,38 78,64 88,68 C 96,72 104,54 112,66 C 118,74 126,58 136,64 C 144,70 152,56 164,62 C 172,66 182,52 194,56 C 208,62 216,42 228,52 C 238,60 252,38 268,48" stroke-width="3.2" />
    
    <!-- Loop & tail flourish -->
    <path d="M 45,36 C 90,20 160,18 215,28 C 248,34 278,52 292,64" stroke-width="2.6" opacity="0.9" />
    
    <!-- Underline stroke with fast taper -->
    <path d="M 38,82 C 95,86 185,84 275,76 C 288,75 295,78 285,82 C 240,94 140,96 70,92" stroke-width="2.8" opacity="0.85" />
    
    <!-- Little dot & accent mark -->
    <circle cx="218" cy="38" r="2.2" fill="#162a56" stroke="none" />
    <path d="M 125,48 L 135,46" stroke-width="2.5" />
  </g>
  <text x="50" y="104" fill="#64748b" font-family="'Inter', Arial, sans-serif" font-size="9" font-weight="600" letter-spacing="1">
    AUTHORIZED SIGNATORY · 360GI LLC
  </text>
</svg>
`.trim();

const DEFAULT_COMPANY_SIGNATURE = `data:image/svg+xml;utf8,${encodeURIComponent(signatureSvg)}`;

module.exports = {
  DEFAULT_360GI_LOGO,
  DEFAULT_COMPANY_STAMP,
  DEFAULT_COMPANY_SIGNATURE,
};
