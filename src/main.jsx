import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import heroContent from './sections/top.html?raw';
import everyone from './sections/everyone.html?raw';
import platform from './sections/platform.html?raw';
import portfolio from './sections/portfolio.html?raw';
import token from './sections/token.html?raw';
import payouts from './sections/payouts.html?raw';
import owners from './sections/owners.html?raw';
import invest from './sections/invest.html?raw';
import about from './sections/about.html?raw';
import closing from './sections/closing.html?raw';
import footer from './sections/footer.html?raw';
import './fonts.css';
import './reference-layout.css';
import './styles.css';

const sections = [
  everyone,
  platform,
  portfolio,
  token,
  payouts,
  owners,
  invest,
  about,
  closing,
];

const navigation = [
  ['Assets', '#portfolio'],
  ['Token', '#token'],
  ['Whitepaper', 'https://myblockstar.com/whitepaper/'],
  ['Ask JET', 'https://myblockstar.com/ask-jet/'],
  ['About Us', '#about'],
  ['Invest', '#invest'],
  ['Insights', 'https://myblockstar.com/insights/'],
];

function Arrow({ diagonal = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a
          className="brand"
          href="#top"
          aria-label="Blockstar — back to top"
          onClick={(event) => {
            event.preventDefault();
            setMenuOpen(false);
            history.replaceState(null, '', window.location.pathname);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="/assets/blockstar-logo.png" alt="Blockstar" width="152" height="38" />
        </a>

        <nav
          id="primary-navigation"
          className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
        >
          {navigation.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <LanguageSelector />
        </nav>

        <div className="header-actions">
          <a className="buy-button" href="https://myblockstar.com/buy-tokens/">
            Buy Tokens
            <Arrow diagonal />
          </a>
          <button
            className="menu-toggle"
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}

function LanguageSelector() {
  const current = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/)?.[1] ?? 'en';

  useEffect(() => {
    if (current === 'en') return;

    window.blockstarTranslate = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        'translation-engine'
      );
    };

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=blockstarTranslate';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      delete window.blockstarTranslate;
    };
  }, [current]);

  const languages = [
    ['en', 'English'],
    ['es', 'Español'],
    ['fr', 'Français'],
    ['it', 'Italiano'],
    ['de', 'Deutsch'],
    ['pt', 'Português'],
    ['ar', 'العربية'],
    ['hi', 'हिन्दी'],
    ['ko', '한국어'],
    ['vi', 'Tiếng Việt'],
    ['ms', 'Bahasa Melayu'],
    ['zh-CN', '中文'],
  ];

  return (
    <label className="language-control notranslate">
      <span aria-hidden="true">◎</span>
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={current}
        onChange={(event) => {
          const value = event.target.value;
          document.cookie = value === 'en'
            ? 'googtrans=;path=/;max-age=0'
            : `googtrans=/en/${value};path=/;SameSite=Lax`;
          window.location.reload();
        }}
      >
        {languages.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <span id="translation-engine" hidden />
    </label>
  );
}

function PropertyArtwork() {
  return (
    <div className="property-artwork" aria-hidden="true">
      <div className="artwork-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <div className="orbit-node node-one" />
      <div className="orbit-node node-two" />
      <svg className="architecture" viewBox="0 0 540 600" fill="none">
        <defs>
          <linearGradient id="facade" x1="120" y1="40" x2="450" y2="540" gradientUnits="userSpaceOnUse">
            <stop stopColor="#446289" />
            <stop offset="1" stopColor="#122a49" />
          </linearGradient>
          <linearGradient id="side" x1="320" x2="460" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1c3a5d" />
            <stop offset="1" stopColor="#0c2039" />
          </linearGradient>
          <linearGradient id="gold" x1="0" x2="480" y2="600" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f3dda8" />
            <stop offset="1" stopColor="#a38449" />
          </linearGradient>
          <pattern id="windows" width="24" height="29" patternUnits="userSpaceOnUse">
            <path d="M4 3h9v16H4z" fill="#c9a55c" fillOpacity=".48" />
            <path d="M4 3h9v16H4z" stroke="#d7c095" strokeOpacity=".32" />
          </pattern>
          <pattern id="side-windows" width="19" height="29" patternUnits="userSpaceOnUse">
            <path d="M5 4v16" stroke="#6694b0" strokeOpacity=".4" strokeWidth="4" />
          </pattern>
        </defs>
        <path d="m65 496 258-104 159 90-261 113z" fill="#102643" stroke="#58728c" strokeOpacity=".5" />
        <path d="m90 478 230-88 130 76-233 98z" fill="#203957" stroke="#c9a55c" strokeOpacity=".4" />
        <path d="m112 270 108-42 1 286-109-60z" fill="url(#facade)" stroke="#66809c" />
        <path d="m221 228 54 32v221l-54 33z" fill="url(#side)" stroke="#466381" />
        <path d="m123 284 85-33v233l-85-45z" fill="url(#windows)" />
        <path d="m209 119 112-48v400l-112 46z" fill="url(#facade)" stroke="#8194a8" />
        <path d="m321 71 91 53v295l-91 52z" fill="url(#side)" stroke="#59728d" />
        <path d="m209 119 91 51 112-46-91-53z" fill="#405b76" stroke="#8fa0b0" />
        <path d="m223 143 84-36v350l-84 34z" fill="url(#windows)" />
        <path d="m334 139 62 35v239l-62 36z" fill="url(#side-windows)" />
        <path d="m256 84 64-27 52 30-64 28z" fill="#243f5d" stroke="url(#gold)" />
        <path d="M320 57V23m-9 43V40m19 27V40" stroke="url(#gold)" />
        <path d="m274 345 91-38 1 165-92 43z" fill="url(#facade)" stroke="#8194a8" />
        <path d="m366 307 70 40v85l-70 40z" fill="url(#side)" stroke="#59728d" />
        <path d="m286 360 66-28v127l-66 30z" fill="url(#windows)" />
        <path d="m108 460 112 59 102-43 46 4 75-43" stroke="url(#gold)" strokeWidth="2" />
        <path d="m91 491 126 70 232-96" stroke="#c9a55c" strokeOpacity=".6" />
        <circle cx="135" cy="499" r="4" fill="#5eead4" />
        <circle cx="421" cy="455" r="4" fill="#c9a55c" />
      </svg>
      <div className="artwork-caption">
        <span className="caption-dot" />
        <span>Real assets. On-chain.</span>
        <span className="solana-mark"><i /><i /><i /></span>
      </div>
      <div className="asset-chip chip-gold">Dubai <span>↗</span></div>
      <div className="asset-chip chip-teal">Ibiza <span>↗</span></div>
      <div className="asset-chip chip-purple">Riyadh <span>↗</span></div>
    </div>
  );
}

function OriginalSection({ html }) {
  return <div className="original-section" dangerouslySetInnerHTML={{ __html: html }} />;
}

function useHomepageMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeouts = [];
    const animationFrames = new Set();

    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });

    const revealElements = document.querySelectorAll(
      'main h2, main h3, main section > div > p, .bs-08d5e67 > p, ' +
      '.bs-68ba019 > div, .bs-f29dbe2 > div, .bs-f801b2b > div, ' +
      '.bs-b9c7bc8, .bs-091c85b, .bs-a43abca > div, .bs-7d127ca > div, ' +
      '.bs-eef0637 > div, .bs-552a558, .bs-67b5f98, .bs-5a416fc, .bs-c68a13f'
    );

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    if (!reducedMotion) {
      revealElements.forEach((element, index) => {
        element.classList.add('reveal');
        element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
        revealObserver.observe(element);
      });
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);

        const element = entry.target;
        const original = element.textContent.trim();
        const match = original.match(/^(\$?)([\d,.]+)(.*)$/);
        if (!match || reducedMotion) return;

        const target = Number(match[2].replaceAll(',', ''));
        const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / 1500, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = (target * eased).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          });

          element.textContent = `${match[1]}${value}${match[3]}`;
          if (progress < 1) {
            const frame = requestAnimationFrame(tick);
            animationFrames.add(frame);
          } else {
            element.textContent = original;
          }
        }

        element.setAttribute('aria-label', original);
        const frame = requestAnimationFrame(tick);
        animationFrames.add(frame);
      });
    }, { threshold: 0.7 });

    document.querySelectorAll(
      '.bs-04ddf33 > p:first-child, .bs-804b615, .bs-25fcb64, ' +
      '.bs-b850333, .bs-271e4ea, .bs-161c550'
    ).forEach((element) => counterObserver.observe(element));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
      animationFrames.forEach(cancelAnimationFrame);
      timeouts.forEach(clearTimeout);
    };
  }, []);
}

function App() {
  const [formMessage, setFormMessage] = useState(null);
  useHomepageMotion();

  useEffect(() => {
    const form = document.querySelector('.bs-form');
    const name = document.getElementById('inv-name');
    const accredited = document.getElementById('inv-acc');
    name.required = true;
    accredited.required = true;

    function handleSubmit(event) {
      event.preventDefault();
      setFormMessage('This is a design preview. Your request has not been sent. Contact JET directly for investor materials.');
    }

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content">
        <div className="hero-composition">
          <OriginalSection html={heroContent} />
          <PropertyArtwork />
          <a className="scroll-cue" href="#everyone" aria-label="Explore ownership for everyone">
            <span />
            <Arrow />
          </a>
        </div>
        {sections.map((html, index) => (
          <OriginalSection key={index} html={html} />
        ))}
      </main>
      <OriginalSection html={footer} />
      {formMessage && (
        <div className="preview-notice" role="status">
          <p>{formMessage}</p>
          <a href="mailto:jet@myblockstar.com">Email JET <Arrow diagonal /></a>
          <button onClick={() => setFormMessage(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
