import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityPool: LiquidityContractConfig = {
  name: 'LiquidityPool',
  [MUMBAI.chainId]: {
    address: '0xDe4e4CDa407Eee8d9E76261a1F2d229A572743dE',
  },
  [GOERLI.chainId]: {
    address: '0x8033Bd14c4C114C14C910fe05Ff13DB4C481a85D',
  },
  [FUJI.chainId]: {
    address: '0xB726675394b2dDeE2C897ad31a62C7545Ad7C68D',
  },
};
