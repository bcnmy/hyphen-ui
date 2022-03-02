import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityProviders: LiquidityContractConfig = {
  name: 'LiquidityProviders',
  [MUMBAI.chainId]: {
    address: '0xf6C7A17d6C2b825b0C0A7E4B0d41eF749243F960',
  },
  [GOERLI.chainId]: {
    address: '0xe66e281425B7aA07F7c9f53EdD79302615b39B32',
  },
  [FUJI.chainId]: {
    address: '0x4B57128F8070703D19423Ae04C6162df003B2c0c',
  },
};
