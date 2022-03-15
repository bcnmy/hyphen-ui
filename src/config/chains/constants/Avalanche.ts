import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import avaxIcon from '../../../assets/images/tokens/avax-icon.svg';

export const AVALANCHE: ChainConfig = {
  name: 'Avalanche',
  image: avaxIcon,
  subText: 'Avalanche mainnet',
  chainId: 43114,
  chainColor: '#E841421A',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  currency: 'AVAX',
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: '',
  biconomy: {
    enable: false,
    apiKey: 'jndkOSkVO.e9e51b91-ded9-4371-8eba-c5e8c7ec84d7',
  },
  assetSentTopicId:
    '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',
  networkAgnosticTransfer: false, // Set this to enable network agnostic gasless transactions
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/hyphen-avalanche',
  v2GraphURL:
    'https://thegraph.com/hosted-service/subgraph/shantanu-bico/hyphenv2-liquidity-pool-avalanche',
  explorerUrl: 'https://snowtrace.io',
};
