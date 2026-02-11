// frontend/postcss.config.js
module.exports = {
    plugins: {
        tailwindcss: {},          // ← this processes Tailwind classes
        autoprefixer: {},         // ← adds vendor prefixes for browser compatibility
    },
};