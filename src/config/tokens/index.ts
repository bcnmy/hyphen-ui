import { ETH } from "./ETH";
import { USDC } from "./USDC";
import { USDT } from "./USDT";
import { BICO } from "./BICO";

export type TokenConfig = {
  symbol: string;
  image?: string;
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
  ETH,
  USDC,
  USDT,
  BICO
];

export default tokens;
