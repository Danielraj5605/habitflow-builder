import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'system-ui', 'sans-serif'],
				outfit: ['Outfit', 'system-ui', 'sans-serif'],
				poppins: ['Outfit', 'system-ui', 'sans-serif'], // alias kept for backward compat
				mono: ['JetBrains Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
				},
				info: {
					DEFAULT: 'hsl(var(--info))',
					foreground: 'hsl(var(--info-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))',
				},
				// Royal Obsidian raw palette
				obsidian: {
					night: '#0A0A0F',
					amethyst: '#13111C',
					slate: '#1C1929',
					violet: '#272336',
				},
				gold: {
					royal: '#D4A846',
					burnished: '#E8C05A',
				},
				sapphire: '#4A7BF7',
				amethyst: '#9B6DFF',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			backgroundImage: {
				'gradient-royal': 'var(--gradient-royal)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-achievement': 'var(--gradient-achievement)',
				'gradient-streak': 'var(--gradient-streak)',
				'gradient-sapphire': 'var(--gradient-sapphire)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-surface': 'var(--gradient-surface)',
			},
			boxShadow: {
				'glow-gold': 'var(--shadow-glow-gold)',
				'glow-purple': 'var(--shadow-glow-purple)',
				'glow-blue': 'var(--shadow-glow-blue)',
				'soft': 'var(--shadow-sm)',
				'medium': 'var(--shadow-md)',
				'large': 'var(--shadow-lg)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 12px rgba(212,168,70,0.2)' },
					'50%': { boxShadow: '0 0 24px rgba(212,168,70,0.4)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out both',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
