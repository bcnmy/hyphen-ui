import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityPool: LiquidityContractConfig = {
  name: 'LiquidityPool',
  [MUMBAI.chainId]: {
    address: '0xFFe2aB07484f91a9E48a71F7Cd9a8C9E6911eB56',
  },
  [GOERLI.chainId]: {
    address: '0x55EA70A11E7AcE4C21225Fb84aDA36467622f6d7',
  },
  [FUJI.chainId]: {
    address: '0x4C943bA53DDAb515D4E8fe968CecE3BBB0f0C738',
  },
};
