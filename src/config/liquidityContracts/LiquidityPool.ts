import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { LiquidityContractConfig } from '.';

export const LiquidityPool: LiquidityContractConfig = {
  name: 'LiquidityPool',
  [MUMBAI.chainId]: {
    address: '0x5a63a7Eb13C121cCeF718b28d7e75C68E455a25c',
  },
  [GOERLI.chainId]: {
    address: '0xF8dD686e6674ea5ABb37134e05E38637267bB647',
  },
  [FUJI.chainId]: {
    address: '0x1b1565440Ce9b947233EDDcCe9716D665962948c',
  },
};
