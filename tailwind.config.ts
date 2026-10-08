import type { Config } from 'tailwindcss'

/*
  Paleta extraída dos frames do Figma (valores amostrados dos PNGs exportados):
  fundo ............ #140d0a   painel/cards ...... #241612
  linhas ........... #432c1a   borda de campos ... #3f2319
  laranja (botões) . #d28a4c   laranja (textos) .. #e89b55
  texto claro ...... #f5f1eb   texto bege ........ #cfb28c   bege apagado ... #b39463
*/
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        sans: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        background: '#140d0a',
        foreground: '#f5f1eb',
        panel: '#241612',
        panel2: '#2f1b15',
        band: '#38220f',
        border: '#432c1a',
        field: '#3f2319',
        accent: { DEFAULT: '#d28a4c', light: '#e89b55' },
        accent2: '#c87636',
        muted: { DEFAULT: '#cfb28c', dim: '#b39463' },
        danger: '#e76f51',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(0,0,0,.35)',
      },
      borderRadius: {
        xl2: '1.5rem',
      },
      maxWidth: {
        page: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config
