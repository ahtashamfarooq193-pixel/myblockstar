import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LogoEntrance from './LogoEntrance.jsx';
import FloatingHeroColors from './FloatingHeroColors.jsx';
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
import './light-theme.css';
import './header-refinements.css';
import './section-refinements.css';
import './platform.css';
import './control-polish.css';
import './payouts-navigation.css';
import './building-depth.css';
import './hero-theme.css';
import './brand-surfaces.css';
import './palette.css';
import './header-polish.css';
import './header-floating.css';
import './hero-mesh.css';
import './hero-mesh-motion.css';

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

function goHome(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (window.location.pathname !== '/') {
    window.location.assign('/');
    return;
  }
  history.replaceState(null, '', '/');
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

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
  const [activeLink, setActiveLink] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 });
  const navigationRef = useRef(null);

  useLayoutEffect(() => {
    const nav = navigationRef.current;
    if (!nav) return;
    function positionIndicator() {
      const target = [...nav.querySelectorAll('a')].find((link) => link.getAttribute('href') === (hoveredLink ?? activeLink));
      if (!target || !nav.clientWidth) {
        setIndicatorStyle({ opacity: 0 });
        return;
      }
      setIndicatorStyle({
        opacity: 1,
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translate3d(${target.offsetLeft}px, ${target.offsetTop}px, 0)`,
      });
    }
    positionIndicator();
    const observer = new ResizeObserver(positionIndicator);
    observer.observe(nav);
    document.fonts.ready.then(positionIndicator);
    return () => observer.disconnect();
  }, [hoveredLink, activeLink, menuOpen]);

  useEffect(() => {
    let frame = 0;
    const sectionLinks = {
      portfolio: '#portfolio',
      token: '#token',
      payouts: '#token',
      owners: '#portfolio',
      invest: '#invest',
      about: '#about',
    };

    function updateActiveSection() {
      setScrolled(window.scrollY > 24);
      const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 100;
      const readingLine = headerHeight + Math.min(innerHeight * 0.2, 140);
      let current = null;
      document.querySelectorAll('main section').forEach((section) => {
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= readingLine && bounds.bottom > readingLine) {
          current = sectionLinks[section.id] ?? null;
        }
      });
      setActiveLink(current);
      frame = 0;
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(updateActiveSection);
    }

    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

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
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-inner">
        <a
          className="brand"
          href="/"
          aria-label="Blockstar — back to top"
          onClick={(event) => {
            setMenuOpen(false);
            setActiveLink(null);
            goHome(event);
          }}
        >
          <img src="/assets/blockstar-logo.png" alt="Blockstar" width="152" height="38" />
        </a>

        <nav
          id="primary-navigation"
          className={`primary-navigation ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
          ref={navigationRef}
          onPointerLeave={() => setHoveredLink(null)}
        >
          <span className="nav-moving-highlight" style={indicatorStyle} aria-hidden="true" />
          {navigation.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className={activeLink === href ? 'is-current' : undefined}
              aria-current={activeLink === href ? 'location' : undefined}
              onClick={() => setMenuOpen(false)}
              onPointerEnter={() => setHoveredLink(href)}
              onFocus={() => setHoveredLink(href)}
              onBlur={() => setHoveredLink(null)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <LanguageSelector />
          <a className="buy-button" href="https://myblockstar.com/buy-tokens/">
            Buy Tokens
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
  const [open, setOpen] = useState(false);
  const picker = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    function dismiss(event) {
      if (!picker.current?.contains(event.target)) setOpen(false);
    }
    function escape(event) {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

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
    <div
      className="language-picker language-refined notranslate"
      ref={picker}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        className="language-button"
        aria-label="Choose language"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'language-list' : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => picker.current?.querySelector('[role="menuitemradio"]')?.focus());
          }
        }}
      >
        <span className="language-globe" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <ellipse cx="12" cy="12" rx="4" ry="9" />
            <path d="M3 12h18" />
          </svg>
        </span>
        <span className="language-name">{languages.find(([value]) => value === current)?.[1] ?? 'English'}</span>
        <span className="language-caret" aria-hidden="true" />
      </button>
      {open && (
        <div
          id="language-list"
          className="language-list"
          role="menu"
          aria-label="Languages"
          onKeyDown={(event) => {
            const items = [...event.currentTarget.querySelectorAll('button')];
            const index = items.indexOf(document.activeElement);
            let next;
            if (event.key === 'ArrowDown') next = (index + 1) % items.length;
            if (event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = items.length - 1;
            if (next !== undefined) {
              event.preventDefault();
              items[next].focus();
            }
          }}
        >
          {languages.map(([value, label]) => (
            <button
              key={value}
              role="menuitemradio"
              aria-checked={value === current}
              className="language-row"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
                if (value === current) return;
                document.cookie = value === 'en'
                  ? 'googtrans=;path=/;max-age=0'
                  : `googtrans=/en/${value};path=/;SameSite=Lax`;
                window.location.reload();
              }}
            >
              <span>{label}</span>
              {value === current && <span className="selected-language-dot" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
      <span id="translation-engine" hidden />
    </div>
  );
}

function PropertyArtwork({ deferRendering = false }) {
  const artwork = useRef(null);

  useEffect(() => {
    const host = artwork.current;
    let disposeScene;
    let cancelled = false;
    let loading = false;
    let pageLoading = true;
    const assetCleanup = [];
    let resolveWindowLoad;
    const windowLoaded = new Promise((resolve) => { resolveWindowLoad = resolve; });

    function finishPageLoading() {
      pageLoading = false;
      host.removeAttribute('data-intro');
    }

    async function prepareScene() {
      if (deferRendering || loading || cancelled || !window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
      loading = true;
      try {
        const { mountBuildingScene } = await import('./building-matched-scene.js');
        if (!cancelled) {
          disposeScene = mountBuildingScene(host);
          if (host.dataset.webglReady === 'true' && host.dataset.intro === 'pending' && pageLoading) {
            host.dataset.intro = 'playing';
          } else {
            finishPageLoading();
          }
        }
      } catch (error) {
        // The complete SVG treatment remains available if WebGL is unsupported.
        host.removeAttribute('data-webgl-ready');
        host.removeAttribute('data-intro');
        console.warn('Building preview kept its SVG fallback:', error);
      }
    }

    host.addEventListener('pointerenter', prepareScene);
    window.addEventListener('load', resolveWindowLoad, { once: true });
    if (document.readyState === 'complete') resolveWindowLoad();
    const canAnimate = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
    const poster = host.querySelector('.building-poster');
    if (poster?.complete && poster.naturalWidth) host.dataset.posterReady = 'true';
    if (canAnimate) {
      host.dataset.intro = 'pending';
    }
    const visibleAssets = [...document.images]
      .filter((image) => image.loading !== 'lazy' && !image.complete)
      .map((image) => new Promise((resolve) => {
        function settled() {
          image.removeEventListener('load', settled);
          image.removeEventListener('error', settled);
          resolve();
        }
        image.addEventListener('load', settled, { once: true });
        image.addEventListener('error', settled, { once: true });
        assetCleanup.push(settled);
      }));
    Promise.all([windowLoaded, document.fonts.ready, ...visibleAssets]).then(() => {
      if (!cancelled) finishPageLoading();
    });
    const warmup = window.setTimeout(prepareScene, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(warmup);
      host.removeAttribute('data-intro');
      host.removeEventListener('pointerenter', prepareScene);
      window.removeEventListener('load', resolveWindowLoad);
      assetCleanup.forEach((cleanup) => cleanup());
      disposeScene?.();
    };
  }, [deferRendering]);

  return (
    <div
      className="property-artwork"
      aria-hidden="true"
      ref={artwork}
    >
      <div className="artwork-grid" />
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="orbit orbit-three" />
      <img
        className="building-poster"
        src="/assets/building-3d-poster.png"
        alt=""
        width="540"
        height="600"
        fetchPriority="high"
        onLoad={() => {
          if (artwork.current) artwork.current.dataset.posterReady = 'true';
        }}
      />
      <svg className="architecture" viewBox="0 0 540 600" fill="none">
        <defs>
          <linearGradient id="building-purple" x1="210" y1="90" x2="335" y2="510" gradientUnits="userSpaceOnUse">
            <stop stopColor="#cbbce0" />
            <stop offset="0.35" stopColor="#927eac" />
            <stop offset="0.7" stopColor="#79678f" />
            <stop offset="1" stopColor="#514963" />
          </linearGradient>
          <linearGradient id="building-teal" x1="110" y1="240" x2="225" y2="510" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a4cec5" />
            <stop offset="0.4" stopColor="#669c96" />
            <stop offset="1" stopColor="#346461" />
          </linearGradient>
          <linearGradient id="building-gold" x1="275" y1="310" x2="365" y2="515" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dac89f" />
            <stop offset="0.4" stopColor="#ad966b" />
            <stop offset="1" stopColor="#776344" />
          </linearGradient>
          <linearGradient id="building-purple-side" x1="321" y1="80" x2="410" y2="470" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6e6385" />
            <stop offset="1" stopColor="#302d43" />
          </linearGradient>
          <linearGradient id="building-teal-side" x1="220" y1="235" x2="275" y2="510" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4c817c" />
            <stop offset="1" stopColor="#244746" />
          </linearGradient>
          <linearGradient id="building-gold-side" x1="365" y1="310" x2="435" y2="475" gradientUnits="userSpaceOnUse">
            <stop stopColor="#85734f" />
            <stop offset="1" stopColor="#443c31" />
          </linearGradient>
          <clipPath id="building-front-surfaces">
            <path d="M112 270 220 330 220 514 112 454Z" />
            <path d="M209 119 300 170 300 517 209 466Z" />
            <path d="M274 345 344 384 344 515 274 476Z" />
          </clipPath>
          <clipPath id="building-side-surfaces">
            <path d="M300 170 412 124 412 471 300 517Z" />
            <path d="M220 330 274 300 274 484 220 514Z" />
            <path d="M344 384 436 347 436 478 344 515Z" />
          </clipPath>
          <linearGradient id="architectural-glass" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#d7e7e9" stopOpacity="0.9" />
            <stop offset="0.18" stopColor="#7fa1ae" stopOpacity="0.7" />
            <stop offset="0.45" stopColor="#284e67" />
            <stop offset="0.55" stopColor="#b4ced4" stopOpacity="0.8" />
            <stop offset="0.62" stopColor="#426b7d" />
            <stop offset="1" stopColor="#203d53" />
          </linearGradient>
          <linearGradient id="facade-reflection" x1="110" y1="120" x2="390" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.3" stopColor="#d7e9ed" stopOpacity="0.04" />
            <stop offset="0.38" stopColor="#d7e9ed" stopOpacity="0.4" />
            <stop offset="0.42" stopColor="#d7e9ed" stopOpacity="0.03" />
            <stop offset="0.66" stopColor="#d7e9ed" stopOpacity="0.05" />
            <stop offset="0.74" stopColor="#d7e9ed" stopOpacity="0.25" />
            <stop offset="1" stopColor="#d7e9ed" stopOpacity="0" />
          </linearGradient>
          <pattern id="real-window-bays" width="24" height="29" patternUnits="userSpaceOnUse">
            <path d="M3 2h12v21H3z" fill="#172f40" />
            <path d="M4 3h10v18H4z" fill="url(#architectural-glass)" />
            <path d="M9 3v18M4 13h10" stroke="#bcc9c9" strokeOpacity="0.65" strokeWidth="0.7" />
            <path d="M3 23h13v2H3z" fill="#b0b8b2" fillOpacity="0.6" />
            <path d="M3 25h13" stroke="#142c40" strokeOpacity="0.7" />
            <path d="M0 28h24" stroke="#172f42" strokeOpacity="0.4" />
          </pattern>
          <pattern id="real-side-bays" width="19" height="29" patternUnits="userSpaceOnUse">
            <path d="M4 3h7v20H4z" fill="#112a3b" />
            <path d="M5 4h5v17H5z" fill="#658999" fillOpacity="0.65" />
            <path d="M7.5 4v17M5 13h5" stroke="#a3bbc3" strokeOpacity="0.4" strokeWidth="0.6" />
            <path d="M0 27h19" stroke="#8ba3af" strokeOpacity="0.3" />
          </pattern>
          <linearGradient id="facade-real" x1="120" y1="100" x2="340" y2="490" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b5c3c9" />
            <stop offset="0.22" stopColor="#72909e" />
            <stop offset="0.48" stopColor="#4b6c80" />
            <stop offset="0.72" stopColor="#658294" />
            <stop offset="1" stopColor="#294860" />
          </linearGradient>
          <linearGradient id="side-real" x1="320" y1="95" x2="420" y2="470" gradientUnits="userSpaceOnUse">
            <stop stopColor="#446c84" />
            <stop offset="0.3" stopColor="#26475e" />
            <stop offset="0.7" stopColor="#173247" />
            <stop offset="1" stopColor="#0e2438" />
          </linearGradient>
          <linearGradient id="roof-real" x1="210" y1="70" x2="410" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b9c7cb" />
            <stop offset="0.5" stopColor="#7e959f" />
            <stop offset="1" stopColor="#496879" />
          </linearGradient>
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
        <path className="building-footing-teal" d="M112 454 220 514 274 484 274 489 220 519 112 459Z" fill="#324b5c" />
        <path className="building-wing-teal" d="M112 270 220 330 220 514 112 454Z" fill="url(#facade)" stroke="#66809c" />
        <path className="building-wing-teal-side" d="M220 330 274 300 274 484 220 514Z" fill="url(#side)" stroke="#466381" />
        <path className="building-wing-teal-roof" d="M112 270 220 330 274 300 166 240Z" fill="#405b76" stroke="#8fa0b0" />
        <path d="M112 270 220 330 220 514 112 454Z" fill="url(#windows)" />
        <path className="building-footing-purple" d="M209 466 300 517 412 471 412 476 300 522 209 471Z" fill="#324b5c" />
        <path className="building-wing-purple" d="M209 119 300 170 300 517 209 466Z" fill="url(#facade)" stroke="#8194a8" />
        <path className="building-wing-purple-side" d="M300 170 412 124 412 471 300 517Z" fill="url(#side)" stroke="#59728d" />
        <path d="m209 119 91 51 112-46-91-53z" fill="#405b76" stroke="#8fa0b0" />
        <path d="M209 119 300 170 300 517 209 466Z" fill="url(#windows)" />
        <path d="M300 170 412 124 412 471 300 517Z" fill="url(#side-windows)" />
        <path d="m256 84 64-27 52 30-64 28z" fill="#243f5d" stroke="url(#gold)" />
        <path d="M320 57V23m-9 43V40m19 27V40" stroke="url(#gold)" />
        <path className="building-footing-gold" d="M274 476 344 515 436 478 436 483 344 520 274 481Z" fill="#324b5c" />
        <path className="building-wing-gold" d="M274 345 344 384 344 515 274 476Z" fill="url(#facade)" stroke="#8194a8" />
        <path className="building-wing-gold-side" d="M344 384 436 347 436 478 344 515Z" fill="url(#side)" stroke="#59728d" />
        <path className="building-wing-gold-roof" d="M274 345 344 384 436 347 366 307Z" fill="#405b76" stroke="#8fa0b0" />
        <path d="M274 345 344 384 344 515 274 476Z" fill="url(#windows)" />
        <path d="m91 491 126 70 232-96" stroke="#c9a55c" strokeOpacity=".6" />
        <g className="real-building-detail">
          <g clipPath="url(#building-front-surfaces)">
            <path d="M105 70h270v450H105z" fill="url(#real-window-bays)" />
            <path d="M105 70h270v450H105z" fill="url(#facade-reflection)" />
            <path d="M209 119V466M300 170V517M412 124V471" stroke="#e3e0ce" strokeOpacity="0.55" strokeWidth="1.3" />
          </g>
          <g clipPath="url(#building-side-surfaces)">
            <path d="M219 70h220v450H219z" fill="url(#real-side-bays)" />
          </g>
          <path d="M209 119 300 170 412 124M300 170V517" stroke="#dce6e5" strokeOpacity="0.5" />
          <path d="m273 99 32 18 44-18-32-18z" fill="#365469" stroke="#97aeb5" strokeWidth="0.7" />
          <path d="m280 98 25 14 34-14-24-13z" fill="#1c3448" />
          <path d="m290 94 24 13m-18-16 24 13m-18-16 24 13" stroke="#88a0aa" strokeWidth="1.2" />
          <path d="m232 127 19 10 20-8-19-10z" fill="#82969d" stroke="#bfd0d2" strokeWidth="0.6" />
          <path d="m232 127 19 10v7l-19-10z" fill="#435f70" />
          <path d="m251 137 20-8v7l-20 8z" fill="#2c465b" />
        </g>
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
  return (
    <div
      className="original-section"
      onClick={(event) => {
        if (event.target.closest('a[data-home-link]')) goHome(event);
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function useHomepageMotion(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
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
      revealElements.forEach((element) => {
        element.classList.add('reveal');
        const siblings = [...element.parentElement.children]
          .filter((sibling) => sibling.matches('h2, h3, p, div'));
        const position = Math.max(0, siblings.indexOf(element));
        element.style.setProperty('--reveal-delay', `${Math.min(position, 3) * 75}ms`);
        revealObserver.observe(element);
      });
    }

    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-filled');
        progressObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    if (!reducedMotion) {
      document.querySelectorAll('.bs-c9db056').forEach((track) => {
        track.classList.add('progress-animate');
        progressObserver.observe(track);
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
      progressObserver.disconnect();
      animationFrames.forEach(cancelAnimationFrame);
      timeouts.forEach(clearTimeout);
    };
  }, [enabled]);
}

function App() {
  const [formMessage, setFormMessage] = useState(null);
  const [introActive, setIntroActive] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finishIntro = useCallback(() => setIntroActive(false), []);
  useHomepageMotion(!introActive);

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
      {introActive && <LogoEntrance onComplete={finishIntro} />}
      <div className="page-shell" inert={introActive}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content">
        <div className="hero-composition">
          <FloatingHeroColors />
          <OriginalSection html={heroContent} />
          <PropertyArtwork deferRendering={introActive} />
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
          <a href="mailto:jet@myblockstar.com">Email JET</a>
          <button onClick={() => setFormMessage(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}
      </div>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
