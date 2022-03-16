import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import maticIcon from '../../../assets/images/tokens/matic-icon.svg';

export const POLYGON: ChainConfig = {
  name: 'Polygon',
  image: maticIcon,
  subText: 'Polygon Mainnet',
  chainId: 137,
  chainColor: '#8247E51A',
  rpcUrl: 'https://polygon-rpc.com/',
  currency: 'MATIC',
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: '',
  biconomy: {
    enable: true,
    apiKey: 'jYEsJEDel.8bc71a9b-4097-4f77-98dc-3a713e3988b9',
  },
  assetSentTopicId:
    '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',
  networkAgnosticTransfer: true,
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/hyphenpolygonv2',
  v2GraphURL:
    'https://api.thegraph.com/subgraphs/name/shantanu-bico/hyphenv2-liquidity-pool-polygon',
  explorerUrl: 'https://polygonscan.com',
};
