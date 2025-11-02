import { tailwindColors } from '../shared-design-tokens.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: tailwindColors,
    },
  },
  plugins: [],
};
