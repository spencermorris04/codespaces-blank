import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { backgroundColor: 'white' },
          '50%': { backgroundColor: 'rgba(229, 231, 235, var(--tw-bg-opacity))' }, // light grey color
        },
      },
      animation: {
        'flash': 'flash 1s ease-in-out infinite',
      },
      outlineWidth: {
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        5: '5px',
        6: '6px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'neo-blue': '#7DF9FF',
        'neo-purple': '#3300FF',
        'neo-pink': '#FF00F5',
        'neo-yellow': '#FFFF00',
        'neo-orange': '#FF4911',
        'neo-red': '#FF4711',
        'neo-green': '#2FFF2F',
        'neo-light-blue': '#DAF5F0',
        'neo-light-green': '#BAFCA2',
        'neo-light-yellow': '#FDFD96',
        'neo-light-orange': '#F8D6B3',
        'neo-light-pink': '#FFF5EE',
        'neo-light-purple': '#E3DFF2',
        'neo-light-cream': '#FFFDD0',
      },
      scrollbar: {
        // Define your custom scrollbar styles here
        default: 'none', // Hide scrollbar for all elements by default
      },
    },
  },
  plugins: [],
}
export default config
