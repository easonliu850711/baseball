import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 🌊 深海藍白色彩系統
        // 深層海洋背景層級
        'ocean-abyss': '#0a1628',
        'ocean-deep': '#0f2240',
        'ocean-mid': '#1a3a5c',
        'ocean-light': '#2d5f8a',
        
        // 海洋表面與光影
        'ocean-surface': '#4a8fc0',
        'ocean-wave': '#6cb4e4',
        'ocean-foam': '#a8d8f0',
        'ocean-spray': '#d4edf7',
        
        // 白與灰階（文字與背景系統）
        'pure-white': '#ffffff',
        'shell-white': '#f0f4f8',
        'cloud-gray': '#dce3ed',
        'stone-gray': '#94a3b8',
        'slate-gray': '#64748b',
        'charcoal': '#334155',
        'deep-charcoal': '#1e293b',
        
        // 珊瑚點綴色（少量亮色）
        'coral': '#ff6b6b',
        'coral-light': '#ff8e8e',
        'seafoam': '#34d399',
        'seafoam-dark': '#10b981',
        'sunray': '#fbbf24',
        'sunray-dark': '#f59e0b',
        
        // 發光效果（海洋螢光）
        'glow-ocean': 'rgba(75, 143, 192, 0.25)',
        'glow-wave': 'rgba(108, 180, 228, 0.2)',
        'glow-foam': 'rgba(168, 216, 240, 0.15)',
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'jetbrains-mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'drift': 'drift 12s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0px) scaleY(1)' },
          '50%': { transform: 'translateY(-6px) scaleY(1.02)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px var(--glow-ocean)' },
          '50%': { boxShadow: '0 0 40px var(--glow-wave)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
          '33%': { transform: 'translateX(10px) rotate(1deg)' },
          '66%': { transform: 'translateX(-5px) rotate(-0.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0a1628, #0f2240, #1a3a5c)',
        'ocean-surface-gradient': 'linear-gradient(135deg, #1a3a5c, #2d5f8a, #4a8fc0)',
        'ocean-light-gradient': 'linear-gradient(135deg, #4a8fc0, #6cb4e4, #a8d8f0)',
        'ocean-shimmer': 'linear-gradient(90deg, transparent, rgba(168, 216, 240, 0.08), transparent)',
      },
      boxShadow: {
        'ocean-deep': '0 10px 30px rgba(10, 22, 40, 0.5)',
        'ocean-glow': '0 0 20px rgba(75, 143, 192, 0.25)',
        'ocean-subtle': '0 4px 12px rgba(10, 22, 40, 0.2)',
        'ocean-card': '0 8px 32px rgba(10, 22, 40, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
