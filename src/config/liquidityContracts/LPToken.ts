import { AVALANCHE } from 'config/chains/constants/Avalanche';
import { ETHEREUM } from 'config/chains/constants/Ethereum';
import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { POLYGON } from 'config/chains/constants/Polygon';
import { LiquidityContractConfig } from '.';

export const LPToken: LiquidityContractConfig = {
  name: 'LPToken',
  [MUMBAI.chainId]: {
    address: '0x48E2577e5f781CBb3374912a31b1aa39c9E11d39',
  },
  [GOERLI.chainId]: {
    address: '0x4644FAB4089f1241899BE7007E9399B06A399972',
  },
  [FUJI.chainId]: {
    address: '0x3C30506d3cBfa117d007a8c9813Ff93b3Bffa357',
  },
  [POLYGON.chainId]: {
    address: '0xc49B65e5a350292Afda1f239eBefE562668717c2'
  },
  [ETHEREUM.chainId]: {
    address: '0xc49B65e5a350292Afda1f239eBefE562668717c2'
  },
  [AVALANCHE.chainId]: {
    address: '0xc49B65e5a350292Afda1f239eBefE562668717c2'
  }
};
