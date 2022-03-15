import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import maticIcon from '../../../assets/images/tokens/matic-icon.svg';

export const MUMBAI: ChainConfig = {
  name: 'Mumbai',
  image: maticIcon,
  subText: 'Polygon testnet',
  chainId: 80001,
  chainColor: '#8247E51A',
  rpcUrl: 'https://rpc-mumbai.matic.today',
  currency: 'MATIC',
  // currency: "Test MATIC",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: 'https://faucet.matic.network/',
  biconomy: {
    enable: true,
    apiKey: 'caJKZjSLf.6b37855a-e928-4bbd-95b7-4368c00ffe58',
  },
  assetSentTopicId:
    '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',
  networkAgnosticTransfer: true, // Set this to enable network agnostic gasless transactions
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/lpmanagermumbai',
  v2GraphURL:
    'https://api.thegraph.com/subgraphs/name/shantanu-bico/hyphenv2-liquidity-pool-mumbai',
  explorerUrl: 'https://mumbai.polygonscan.com',
};
