/*****************
 Tailwind config for Blockance
*****************/
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'xlx': '26px',
        'button': '20px'
      },
      boxShadow: {
        glass: '0 8px 24px rgba(0,0,0,0.05)',
        'glass-hover': '0 12px 28px rgba(0,0,0,0.08)'
      },
      colors: {
        primary: {
          light: '#4db6e4',
          DEFAULT: '#007aff',
          dark: '#005bbb'
        },
        accent: '#9b59b6',
        text: {
          primary: '#1a1a1a',
          secondary: '#4a4a4a',
          muted: '#6b7280'
        },
        background: {
          light: '#f8fafc',
          DEFAULT: '#ffffff'
        }
      },
      extend: {
        textColor: {
          primary: '#1a1a1a',
          secondary: '#4a4a4a',
          muted: '#6b7280'
        }
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        floaty: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
          '100%': { transform: 'translateY(0px)' }
        }
      },
      animation: {
        gradient: 'gradientShift 60s ease infinite',
        floaty: 'floaty 12s ease-in-out infinite'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #007aff, #5b9aff)',
        'gradient-accent': 'linear-gradient(90deg, #007aff, #9b59b6)'
      }
    },
  },
  plugins: [],
}
