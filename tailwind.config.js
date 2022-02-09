const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      ...defaultTheme.fontFamily,
      sans: ["Inter", ...defaultTheme.fontFamily.sans],
      mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
    },
    extend: {
      colors: {
        "hyphen-purple": {
          DEFAULT: "#615ccd",
          dark: "#3f3c7e",
          mid: "#464470",
          darker: "#353358",
        },
        "hyphen-gray": {
          100: '#e5e5e5',
          200: "#c1c1c1",
          300: "#545757",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant, e, postcss }) {
      addVariant("firefox", ({ container, separator }) => {
        const isFirefoxRule = postcss.atRule({
          name: "-moz-document",
          params: "url-prefix()",
        });
        isFirefoxRule.append(container.nodes);
        container.append(isFirefoxRule);
        isFirefoxRule.walkRules((rule) => {
          rule.selector = `.${e(
            `firefox${separator}${rule.selector.slice(1)}`
          )}`;
        });
      });
    }),
  ],
};
