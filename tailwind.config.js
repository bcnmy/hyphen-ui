const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      ...defaultTheme.fontFamily,
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
    },
    extend: {
      borderRadius: {
        2.5: '0.625rem',
        7.5: '1.875rem',
        10: '2.5rem',
      },
      colors: {
        'hyphen-purple': {
          DEFAULT: '#615ccd',
          dark: '#3f3c7e',
          mid: '#464470',
          darker: '#353358',
        },
        'hyphen-gray': {
          100: '#e5e5e5',
          200: '#c4c4c4',
          300: '#c1c1c1',
          400: '#545757',
        },
      },
      fontSize: {
        xxs: '0.625rem',
      },
      height: {
        4.5: '1.125rem',
        7.5: '1.875rem',
        15: '3.75rem',
        32.5: '8.125rem',
        37.5: '9.375rem',
        84: '21rem',
        100: '25rem',
        104.5: '26.125rem'
      },
      width: {
        7.5: '1.875rem'
      },
      spacing: {
        12.5: '3.125rem',
        256: '64rem',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant, e, postcss }) {
      addVariant('firefox', ({ container, separator }) => {
        const isFirefoxRule = postcss.atRule({
          name: '-moz-document',
          params: 'url-prefix()',
        });
        isFirefoxRule.append(container.nodes);
        container.append(isFirefoxRule);
        isFirefoxRule.walkRules((rule) => {
          rule.selector = `.${e(
            `firefox${separator}${rule.selector.slice(1)}`,
          )}`;
        });
      });
    }),
  ],
};
