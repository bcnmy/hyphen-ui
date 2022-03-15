import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import avaxIcon from '../../../assets/images/tokens/avax-icon.svg';

export const FUJI: ChainConfig = {
  name: 'Fuji',
  image: avaxIcon,
  subText: 'Avalanche testnet',
  chainId: 43113,
  chainColor: '#E841421A',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  // currency: "Test AVAX",
  currency: 'AVAX',
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: 'https://faucet.avax-test.network/',
  biconomy: {
    enable: false,
    apiKey: 'CdOSOVUtJ.f50d832e-1e7c-45f6-9a2e-9aefc4fc8b56',
  },
  assetSentTopicId:
    '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',
  networkAgnosticTransfer: true, // Set this to enable network agnostic gasless transactions
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/hyphen-fuji',
  v2GraphURL:
    'https://api.thegraph.com/subgraphs/name/shantanu-bico/hyphenv2-liquidity-pool-fuji',
  explorerUrl: 'https://testnet.snowtrace.io',
};
