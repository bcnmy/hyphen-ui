import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityProviders: LiquidityContractConfig = {
  name: 'LiquidityProviders',
  [MUMBAI.chainId]: {
    address: '0xFD210117F5b9d98Eb710295E30FFF77dF2d80002',
  },
  [GOERLI.chainId]: {
    address: '0x658D3F3076e971a74b2712Cf6e9B951BdB2f3fe8',
  },
  [FUJI.chainId]: {
    address: '0x17D42A784928a8168a871fA627bb1e4023D25C2A',
  },
};
