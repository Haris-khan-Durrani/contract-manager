/**
 * defaultAssets.js — Default Corporate Assets for 360 Global Immigration (Client-side)
 */

export const DEFAULT_360GI_LOGO = 'https://assets.cdn.filesafe.space/NJOPxsxylG8ulEPo9hX9/media/6ab2a26318891558b460bf74.png';

export const DEFAULT_COMPANY_STAMP = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <path id="stamp-arc-top" d="M 32,120 A 88,88 0 1,1 208,120" fill="none" />
    <path id="stamp-arc-bottom" d="M 208,120 A 88,88 0 1,1 32,120" fill="none" />
  </defs>

  <circle cx="120" cy="120" r="112" fill="none" stroke="#15325b" stroke-width="3.5" opacity="0.92"/>
  <circle cx="120" cy="120" r="105" fill="none" stroke="#15325b" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.85"/>
  <circle cx="120" cy="120" r="82" fill="none" stroke="#15325b" stroke-width="2" opacity="0.88"/>
  <circle cx="120" cy="120" r="77" fill="none" stroke="#15325b" stroke-width="1" stroke-dasharray="2,2" opacity="0.75"/>

  <text fill="#15325b" font-family="'Cinzel', 'Trajan Pro', Georgia, serif" font-size="11.5" font-weight="700" letter-spacing="2.2" opacity="0.95">
    <textPath href="#stamp-arc-top" startOffset="50%" text-anchor="middle">
      ★ 360 GLOBAL IMMIGRATION ★
    </textPath>
  </text>

  <text fill="#15325b" font-family="'Cinzel', 'Trajan Pro', Georgia, serif" font-size="9.5" font-weight="700" letter-spacing="1.8" opacity="0.92">
    <textPath href="#stamp-arc-bottom" startOffset="50%" text-anchor="middle">
      OFFICIAL CORPORATE SEAL
    </textPath>
  </text>

  <g transform="translate(120, 116)" fill="#15325b" opacity="0.92">
    <path d="M 0,-34 L 2.5,-26 L 10,-26 L 4,-21 L 6,-14 L 0,-18 L -6,-14 L -4,-21 L -10,-26 L -2.5,-26 Z" fill="#c59b27" />
    <rect x="-24" y="-10" width="10" height="26" rx="2" fill="#15325b" />
    <rect x="-26" y="-12" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="-26" y="16" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="-5" y="-14" width="10" height="30" rx="2" fill="#15325b" />
    <rect x="-7" y="-16" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="-7" y="16" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="14" y="-10" width="10" height="26" rx="2" fill="#15325b" />
    <rect x="12" y="-12" width="14" height="3" rx="1" fill="#c59b27" />
    <rect x="12" y="16" width="14" height="3" rx="1" fill="#c59b27" />
    <text y="32" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="7.5" font-weight="bold" fill="#15325b" letter-spacing="1">AUTHENTICATED</text>
  </g>
</svg>
`.trim())}`;

export const DEFAULT_COMPANY_SIGNATURE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 110" width="320" height="110">
  <g fill="none" stroke="#162a56" stroke-linecap="round" stroke-linejoin="round" opacity="0.95">
    <path d="M 28 82 C 34 50, 48 24, 62 26 C 74 28, 64 62, 52 84 C 64 68, 78 52, 92 56 C 104 60, 96 78, 88 84" stroke-width="2.6" />
    <path d="M 88 68 C 102 54, 118 52, 126 62 C 132 70, 128 82, 122 84 C 132 72, 148 56, 160 58 C 170 60, 166 74, 158 84" stroke-width="2.3" />
    <path d="M 158 66 C 172 50, 192 48, 204 58 C 214 66, 210 78, 202 84 C 218 64, 242 46, 260 52 C 274 56, 270 72, 258 84" stroke-width="2.5" />
    <path d="M 38 88 Q 150 94 288 78 Q 230 92 120 96" stroke-width="1.8" />
  </g>
  <text x="180" y="104" font-family="'Cinzel', Georgia, serif" font-size="7.5" font-weight="600" fill="#162a56" opacity="0.65" letter-spacing="1">FOR &amp; ON BEHALF OF 360 GLOBAL IMMIGRATION</text>
</svg>
`.trim())}`;
