/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [
        // require("@tailwindcss/typography") // too big margins
        // https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js
    ],
};
