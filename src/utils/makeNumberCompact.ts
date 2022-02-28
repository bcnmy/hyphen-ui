/**
 * Formats a large number into a compact string
 * @param {*} number number for which a compact value is to be calculated
 * @returns {object} number in compact form
 */
function makeNumberCompact(number: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}

export { makeNumberCompact };
