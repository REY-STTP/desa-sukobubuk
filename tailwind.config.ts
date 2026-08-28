import type { Config } from 'tailwindcss'

/**
 * Catatan: Project ini menggunakan Tailwind v4 dengan theme inline
 * di `app/globals.css` (lihat block `@theme inline`). File ini tetap
 * ada untuk kompatibilitas dengan tooling yang membaca tailwind.config
 * (mis. shadcn CLI, IDE IntelliSense untuk path kustom). Konfigurasi
 * warna & font di sini hanya sebagai fallback dokumentasi.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Earth-Sage (brand primary)
        sage: {
          50:  '#f7f8f4',
          100: '#eaeee2',
          200: '#d2dac0',
          300: '#aebc8e',
          400: '#7a9361',
          500: '#5a7548',
          600: '#455c36',
          700: '#374a2b',
          800: '#2b3a23',
          900: '#1f2a1a',
          950: '#0e150b',
        },
        // Ember (accent — untuk CTA konversi)
        ember: {
          50:  '#fdf5ee',
          100: '#fae6d2',
          200: '#f4cdac',
          300: '#e8a979',
          400: '#d3884f',
          500: '#c27141',
          600: '#a35a30',
          700: '#7e4220',
          800: '#5d3117',
          900: '#3f2110',
        },
        // Stone (neutral warm — BUKAN gray)
        stone: {
          0:   '#ffffff',
          50:  '#fafaf7',
          100: '#f4f3ee',
          200: '#e8e6dd',
          300: '#cfccc0',
          400: '#a3a094',
          500: '#79766a',
          600: '#5b5950',
          700: '#403e37',
          800: '#2a2924',
          900: '#1a1916',
        },
        // Legacy aliases (transisi bertahap ke sage)
        primary: {
          50:  '#f7f8f4',
          100: '#eaeee2',
          200: '#d2dac0',
          300: '#aebc8e',
          400: '#7a9361',
          500: '#5a7548',
          600: '#455c36',
          700: '#374a2b',
          800: '#2b3a23',
          900: '#1f2a1a',
          950: '#0e150b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'grain':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.18 0 0 0 0 0.16 0 0 0 0 0.14 0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        'topo':
          "url(\"data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23455c36' stroke-opacity='0.06' stroke-width='0.75'%3E%3Cpath d='M0 30 Q30 20 60 30 T120 30'/%3E%3Cpath d='M0 60 Q30 50 60 60 T120 60'/%3E%3Cpath d='M0 90 Q30 80 60 90 T120 90'/%3E%3C/g%3E%3C/svg%3E\")",
        'grid':
          "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0H0v32' fill='none' stroke='%23455c36' stroke-opacity='0.05' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'elevated-1': '0 1px 2px hsl(60 12% 18% / 0.04), 0 1px 1px hsl(60 12% 18% / 0.03)',
        'elevated-2': '0 2px 4px hsl(60 12% 18% / 0.05), 0 4px 8px hsl(60 12% 18% / 0.04)',
        'elevated-3': '0 4px 8px hsl(60 12% 18% / 0.06), 0 12px 24px hsl(60 12% 18% / 0.05)',
        'elevated-4': '0 8px 16px hsl(60 12% 18% / 0.08), 0 24px 48px hsl(60 12% 18% / 0.06)',
        'elevated-5': '0 16px 32px hsl(60 12% 18% / 0.10), 0 32px 64px hsl(60 12% 18% / 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'shimmer': 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
