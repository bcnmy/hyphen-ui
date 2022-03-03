import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LPToken: LiquidityContractConfig = {
  name: 'LPToken',
  [MUMBAI.chainId]: {
    address: '0x97fd31fBbE132067f017D0ea1c416A4eb7136917',
  },
  [GOERLI.chainId]: {
    address: '0xD89Dff0b2BE1D7992A2E271931c54367F46DDba1',
  },
  [FUJI.chainId]: {
    address: '0x8c76c0fE215e6116BdE4f0b8eeC98862b48C8A8F',
  },
};
