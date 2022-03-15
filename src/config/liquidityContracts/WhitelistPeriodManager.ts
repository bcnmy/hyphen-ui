import { AVALANCHE } from 'config/chains/constants/Avalanche';
import { ETHEREUM } from 'config/chains/constants/Ethereum';
import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { POLYGON } from 'config/chains/constants/Polygon';
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
  [POLYGON.chainId]: {
    address: '0x684F574CA8C6b52C2b713ad1D1eAcDDF3976e7EB'
  },
  [ETHEREUM.chainId]: {
    address: '0x684F574CA8C6b52C2b713ad1D1eAcDDF3976e7EB'
  },
  [AVALANCHE.chainId]: {
    address: '0x684F574CA8C6b52C2b713ad1D1eAcDDF3976e7EB'
  }
};
