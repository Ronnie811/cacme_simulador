import forms from '@tailwindcss/forms';

export default {
  content: ['./*.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        darkBlue: '#0C0C40',
        darkViolet: '#403262',
        lightViolet: '#5C6185',
        lightGray: '#f3f8fa',
        grayishViolet: 'hsl(257, 7%, 63%)',
        veryDarkBlue: 'hsl(255, 11%, 22%)',
        darkFooter: '#333333',
        greenWaaSabi: '#73ED78'
      },
      fontFamily: {
        sans: ['Montserrat'],
      },
      spacing: {
        180: '32rem',
      }
    },
  },
  plugins: [
    forms
  ]
}
