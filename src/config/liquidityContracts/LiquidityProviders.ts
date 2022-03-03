import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityProviders: LiquidityContractConfig = {
  name: 'LiquidityProviders',
  [MUMBAI.chainId]: {
    address: '0x9a0D29104729a46334618c5c93B995d6F76Bfd7c',
  },
  [GOERLI.chainId]: {
    address: '0x16E6f52B5e01Ad29DB03f1A374a984fb8Ea8Ed40',
  },
  [FUJI.chainId]: {
    address: '0xa4d4D30c4C9ae6893e75445A26123AAE869b6435',
  },
};
