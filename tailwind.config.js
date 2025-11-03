/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Font family setup
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      
      // Color palette from brand guidelines
      colors: {
        // Primary brand colors
        'primary-orange': '#F27A56',
        'accent-magenta': '#9A1A3B',
        'gradient-from': '#D1442F',
        'gradient-to': '#E45A2B',
        
        // Neutral UI colors
        'dark-gray': '#3C3D3D',
        'gray': '#646665',
        'light-gray': '#E5E5E5',
        'white': '#FFFFFF',
        
        // Data visualization colors
        'info-blue': '#177CF3',
        'success-green': '#1D7A34',
        'warning-yellow': '#FED83A',
        'danger-red': '#DE241E',
        
        // Light gradient colors
        'peach': '#FDE2CF',
        'cream': '#FFF8F4',
      },
      
      // Gradient configuration
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #D1442F 0%, #E45A2B 100%)',
        'light-gradient': 'linear-gradient(135deg, #FDE2CF 0%, #FFF8F4 100%)',
      },
      
      // Typography configuration
      fontSize: {
        // Heading sizes
        'h1': ['3rem', { lineHeight: '3.5rem', fontWeight: '700' }], // 48px/56px
        'h2': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }], // 32px/40px
        'h3': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }], // 24px/32px
        'h4': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }], // 18px/28px
        
        // Body text
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px/24px
        'small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '300' }], // 14px/20px
        
        // Buttons and CTAs
        'button': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // 16px/24px
        
        // Forms and inputs
        'input': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px/24px
        
        // Table content
        'table': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '500' }], // 14px/22px
      },
    },
  },
  plugins: [
    // Plugin for easy typography classes
    function({ addUtilities }) {
      const newUtilities = {
        '.text-h1': {
          fontSize: '3rem',
          lineHeight: '3.5rem',
          fontWeight: '700',
        },
        '.text-h2': {
          fontSize: '2rem',
          lineHeight: '2.5rem',
          fontWeight: '700',
        },
        '.text-h3': {
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: '500',
        },
        '.text-h4': {
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
          fontWeight: '500',
        },
        '.text-body': {
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontWeight: '400',
        },
        '.text-small': {
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          fontWeight: '300',
        },
        '.text-button': {
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontWeight: '500',
        },
        '.text-input': {
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontWeight: '400',
        },
        '.text-table': {
          fontSize: '0.875rem',
          lineHeight: '1.375rem',
          fontWeight: '500',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};