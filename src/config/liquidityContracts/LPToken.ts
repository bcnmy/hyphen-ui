import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LPToken: LiquidityContractConfig = {
  name: 'LPToken',
  [MUMBAI.chainId]: {
    address: '0x960BFA8a42543F9972E0177396Ab08E5B1275146',
  },
  [GOERLI.chainId]: {
    address: '0x14aC2F6eeAC5ED94667Ca9f4f3c5f449b733325f',
  },
  [FUJI.chainId]: {
    address: '0x8F06DBd0263A51bCa8bFACCBa4f3554BFB310d62',
  },
};
