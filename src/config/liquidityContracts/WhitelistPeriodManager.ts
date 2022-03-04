import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const WhitelistPeriodManager: LiquidityContractConfig = {
  name: 'WhitelistPeriodManager',
  [MUMBAI.chainId]: {
    address: '0xcA7284D5B079a7d947d47d6169389c3B37DD80b1',
  },
  [GOERLI.chainId]: {
    address: '0x62A0521d3F3B75b70fA39926A0c63CBf819870a6',
  },
  [FUJI.chainId]: {
    address: '0x33d06Fe3d23E18B43c69C2a5C871e0AC7E706055',
  },
};
