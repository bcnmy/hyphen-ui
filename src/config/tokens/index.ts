import { ETH } from './ETH';
import { USDC } from './USDC';
import { USDT } from './USDT';
import { BICO } from './BICO';
import { AVAX } from './AVAX';

export type TokenConfig = {
  symbol: string;
  image?: string;
  coinGeckoId?: string;
  // root level symbol is the common name to be used
  [chainId: number]: {
    address: string;
    transferOverhead: number;
    decimal: number;
    symbol: string;
    fixedDecimalPoint?: number;
    chainColor: string;
    isSupported?: boolean;
  };
};

export const tokens = [AVAX, ETH, USDC, USDT, BICO];

export default tokens;
