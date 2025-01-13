/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts}"],
  purge: {
    enabled: true,
    content: ["./src/**/*.html"],
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
