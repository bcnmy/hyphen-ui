// DO NOT USE
// use ethers.utils.parseUnits and ethers.utils.formatUnits instead

export default function formatRawEthValue(rawValue: string, decimals: number) {
  let formattedNumber;
  formattedNumber = rawValue.toString();
  formattedNumber = formattedNumber.padStart(decimals + 1, '0');
  formattedNumber = `${formattedNumber.substring(0, formattedNumber.length - decimals)}.${formattedNumber.substring(formattedNumber.length - decimals)}`
  
  return formattedNumber;
}