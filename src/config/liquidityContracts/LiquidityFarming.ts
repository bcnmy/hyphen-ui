import { AVALANCHE } from 'config/chains/constants/Avalanche';
import { ETHEREUM } from 'config/chains/constants/Ethereum';
import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { POLYGON } from 'config/chains/constants/Polygon';
import { LiquidityContractConfig } from '.';

export const LiquidityFarming: LiquidityContractConfig = {
  name: 'LiquidityFarming',
  [MUMBAI.chainId]: {
    address: '0xf97859fb869329933b40F36A86E7e44f334Ed16a',
  },
  [GOERLI.chainId]: {
    address: '0x8139F951F6Dc25A77Aa5F41dA661CEef35BF016A',
  },
  [FUJI.chainId]: {
    address: '0xBFAE64B3f3BBC05D466Adb5D5FAd8f520E61FAF8',
  },
  [POLYGON.chainId]: {
    address: '0x781f4EfC37a08C0ea6631204E46B206330c8c161',
  },
  [ETHEREUM.chainId]: {
    address: '0x781f4EfC37a08C0ea6631204E46B206330c8c161',
  },
  [AVALANCHE.chainId]: {
    address: '0x781f4EfC37a08C0ea6631204E46B206330c8c161',
  },
};
