import { AVALANCHE } from 'config/chains/constants/Avalanche';
import { ETHEREUM } from 'config/chains/constants/Ethereum';
import { FUJI } from 'config/chains/constants/Fuji';
import { GOERLI } from 'config/chains/constants/Goerli';
import { MUMBAI } from 'config/chains/constants/Mumbai';
import { POLYGON } from 'config/chains/constants/Polygon';
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
  [POLYGON.chainId]: {
    address: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9'
  },
  [ETHEREUM.chainId]: {
    address: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9'
  },
  [AVALANCHE.chainId]: {
    address: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9'
  }
};
