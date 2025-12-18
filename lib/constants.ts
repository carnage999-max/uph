export const tokens = {
  colors: {
    primary: '#111827',        // Charcoal black
    primaryHover: '#1f2937',   // Slightly lighter
    text: '#171717',           // Near-black text
    muted: '#4b5563',          // Gray-600
    border: '#e5e7eb',         // Gray-200
    surface: '#ffffff',        // White background
    focus: '#2563eb',          // Tailwind blue-600 for focus rings
  },
  radius: { md: '0.75rem', lg: '1rem', xl: '1.25rem' },
  shadow: {
    card: '0 10px 26px rgba(0,0,0,.06)',
    cta: '0 6px 22px rgba(17,24,39,.18)',
    focus: '0 0 0 3px rgba(37, 99, 235, 0.25)', // subtle blue glow
  },
};

export const styles = {
  // Layout & Containers
  container: 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8',
  fullBleed: 'relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden',
  header:
    'sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md',
  nav: 'hidden items-center gap-1 md:flex',
  navLink:
    'rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900',
  navLinkActive: 'bg-gray-900 text-white hover:bg-gray-900 hover:text-white',
  mobileMenuBackdrop: 'fixed inset-0 z-40 bg-black/50',
  mobileMenu:
    'fixed left-0 right-0 top-16 z-50 origin-top rounded-b-2xl border-b border-gray-200 bg-white shadow-xl transition will-change-[transform,opacity] scale-y-95 opacity-0 data-[open=true]:scale-y-100 data-[open=true]:opacity-100 data-[open=false]:scale-y-95 data-[open=false]:opacity-0',
  mobileMenuHeader: 'flex items-center justify-between px-4 py-3',
  mobileMenuLink:
    'block border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700 last:border-b-0 hover:bg-gray-50',
  card:
    'rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg',
  cardPad: 'p-4 sm:p-6',

  // Buttons
  btn: 'inline-flex items-center justify-center rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb] active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
  btnPrimary:
    'bg-gradient-to-b from-[#111827] to-[#0f172a] text-white shadow-[0_6px_22px_rgba(17,24,39,0.18)] hover:shadow-[0_10px_28px_rgba(17,24,39,0.25)]',
  btnGhost:
    'border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900',

  // Typography
  h1: 'font-montserrat text-3xl sm:text-6xl font-bold tracking-tight',
  h2: 'font-montserrat text-xl font-semibold',
  muted: 'text-gray-600',
  badgeDark: 'rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white',

  // Grid Utilities
  grid3: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3',
  grid2: 'grid gap-6 sm:grid-cols-2',

  // 🔹 Form Fields
  inputBase:
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]',
  textarea:
    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 transition-all resize-none focus:outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.25)]',

  // Hero
  hero:
    'relative isolate w-full overflow-hidden bg-gray-900 min-h-[70vh] md:min-h-[85vh]',
  heroSlide:
    'absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out will-change-[opacity,transform]',
  heroImg: 'animate-hero-zoom h-full w-full object-cover',
  heroOverlay:
    'absolute inset-0 flex items-center justify-start text-white',
  heroCta: 'mt-8 flex flex-wrap items-center gap-3',

  // Status Badges
  badgeUnderConstruction: 'inline-flex items-center gap-1.5 rounded-lg bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 border border-orange-200',
};
