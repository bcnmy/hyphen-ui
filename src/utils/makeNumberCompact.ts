/**
 * Formats a large number into a compact string
 * @param {*} number number for which a compact value is to be calculated
 * @returns {object} number in compact form
 */
function makeNumberCompact(number: number, fractionDigits: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(number);
}

export { makeNumberCompact };
