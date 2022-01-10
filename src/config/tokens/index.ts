import { DAI } from "./DAI";
import { ETH } from "./ETH";
import { USDC } from "./USDC";
import { USDT } from "./USDT";

export type TokenConfig = {
  symbol: string;
  // root level symbol is the common name to be used
  [chainId: number]: {
    address: string;
    transferOverhead: number;
    decimal: number;
    symbol: string;
    fixedDecimalPoint?: number;
  };
};

export const tokens = [
  DAI,
  ETH,
  USDC,
  USDT,
];

export default tokens;
