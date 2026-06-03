export const tokens = {
  colors: {
    canvas: '#0a0a0a',
    surface: '#1a1a1a',
    silver: '#e8e8e8',
    silverMuted: '#b0b0b0',
    gold: '#c9a227',
    goldLight: '#e5c878',
    goldDark: '#a57c00',
    borderGold: 'rgba(201, 162, 39, 0.25)',
    primary: '#0a0a0a',
    primaryHover: '#1a1a1a',
    text: '#e8e8e8',
    muted: '#9ca3af',
    border: 'rgba(201, 162, 39, 0.16)',
    surfaceGlass: 'rgba(22, 22, 22, 0.52)',
    focus: 'rgba(201, 162, 39, 0.35)',
  },
  radius: { md: '0.75rem', lg: '1rem', xl: '1.25rem' },
  shadow: {
    card: '0 10px 40px rgba(0,0,0,.42)',
    cta: '0 14px 32px rgba(0,0,0,.55)',
    focus: '0 0 0 3px rgba(201, 162, 39, 0.35)',
  },
};

export const styles = {
  // Layout & Containers
  container: 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
  fullBleed: 'relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden',
  header:
    'sticky top-0 z-50 border-b border-[rgba(201,162,39,0.12)] bg-[#0a0a0a]/85 backdrop-blur-xl',
  nav: 'hidden items-center gap-2 md:flex',
  navLink:
    'rounded-xl px-3 py-2 text-sm font-medium text-[#b0b0b0] transition hover:bg-white/5 hover:text-[#e8e8e8]',
  navLinkActive:
    'bg-white/8 text-[#e8e8e8] ring-1 ring-[rgba(201,162,39,0.2)] hover:bg-white/10 hover:text-white',
  mobileMenuBackdrop: 'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm',
  mobileMenu:
    'fixed left-0 right-0 top-16 z-50 origin-top rounded-b-2xl border-b border-[rgba(201,162,39,0.15)] bg-[#121212]/95 shadow-2xl backdrop-blur-xl transition will-change-[transform,opacity] scale-y-95 opacity-0 data-[open=true]:scale-y-100 data-[open=true]:opacity-100 data-[open=false]:scale-y-95 data-[open=false]:opacity-0',
  mobileMenuHeader: 'flex items-center justify-between px-4 py-3',
  mobileMenuLink:
    'block border-b border-white/5 px-4 py-3 text-sm font-medium text-[#b0b0b0] last:border-b-0 hover:bg-white/5 hover:text-[#e8e8e8]',
  card: 'glass-card',
  cardAdmin:
    'rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg',
  cardPad: 'p-4 sm:p-6',
  cardAdminPad: 'p-4 sm:p-6',

  // Buttons (forms / admin — simpler than luxury plaque)
  btn: 'inline-flex items-center justify-center rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] focus-visible:ring-[rgba(201,162,39,0.5)] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
  btnPrimary:
    'border border-[rgba(201,162,39,0.35)] bg-linear-to-b from-[#1f1f1f] to-[#0a0a0a] text-[#e8e8e8] shadow-[0_6px_22px_rgba(0,0,0,0.35)] hover:border-[rgba(229,200,120,0.45)] hover:shadow-[0_10px_28px_rgba(201,162,39,0.12)]',
  btnGhost:
    'border border-white/12 bg-white/5 text-[#e8e8e8] hover:border-[rgba(201,162,39,0.25)] hover:bg-white/8',

  // Typography
  h1: 'font-cinzel text-3xl sm:text-6xl font-bold tracking-tight text-[#e8e8e8]',
  h2: 'font-cinzel text-xl font-semibold text-[#e8e8e8]',
  h3: 'font-cinzel text-lg font-semibold text-[#e8e8e8]',
  sectionLabel:
    'font-montserrat text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a227]',
  muted: 'text-[#9ca3af]',
  badgeDark:
    'rounded-full border border-[rgba(201,162,39,0.3)] bg-[#0a0a0a]/80 px-3 py-1 text-xs font-semibold text-[#e5c878]',
  linkGold:
    'text-sm font-semibold text-[#c9a227] underline-offset-4 transition hover:text-[#e5c878] hover:underline',
  iconCircle:
    'flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(201,162,39,0.25)] bg-linear-to-b from-[#2a2a2a] to-[#121212] text-[#e5c878] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',

  // Grid Utilities
  grid3: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  grid2: 'grid gap-6 sm:grid-cols-2',

  // Form Fields
  inputBase:
    'w-full rounded-xl border border-white/10 bg-[#1a1a1a]/90 px-3 py-2 text-sm text-[#e8e8e8] placeholder-[#6b7280] transition-all focus:outline-none focus:border-[rgba(201,162,39,0.5)] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.2)]',
  textarea:
    'w-full rounded-xl border border-white/10 bg-[#1a1a1a]/90 px-3 py-2 text-sm text-[#e8e8e8] placeholder-[#6b7280] transition-all resize-none focus:outline-none focus:border-[rgba(201,162,39,0.5)] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.2)]',

  // Hero
  hero:
    'relative isolate w-full overflow-hidden bg-[#0a0a0a] min-h-[70vh] md:min-h-[85vh]',
  heroSlide:
    'absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out will-change-[opacity,transform]',
  heroImg: 'animate-hero-zoom h-full w-full object-cover',
  heroOverlay: 'absolute inset-0 flex items-center justify-start text-white',
  heroCta: 'mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center',

  // Status Badges
  badgeUnderConstruction:
    'inline-flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/50 px-3 py-1 text-xs font-semibold text-orange-300',
};
