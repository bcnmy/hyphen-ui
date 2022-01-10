import { BigNumber } from "ethers";

export default function toFixed(num: string, fixed: number): string {
  let numParts = num.split(".");

  if (numParts.length === 1) {
    return numParts[0];
  } else {
    return `${numParts[0]}.${numParts[1].substring(0, fixed)}`;
  }
}
