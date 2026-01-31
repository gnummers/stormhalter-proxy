/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {} },
  daisyui: { themes: ['dark'] },
  plugins: [require('daisyui')],
};
