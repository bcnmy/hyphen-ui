import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import maticIcon from '../../../assets/images/tokens/matic-icon.svg';

export const MUMBAI: ChainConfig = {
  name: 'Mumbai',
  image: maticIcon,
  subText: 'Polygon testnet',
  chainId: 80001,
  chainColor: '#8247E51A',
  rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  currency: 'MATIC',
  // currency: "Test MATIC",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: 'https://faucet.matic.network/',
  biconomy: {
    enable: true,
    apiKey: 'r8N3i0Ukw.bb5dd97d-af25-47cb-9281-2069f1b95ade',
  },
  assetSentTopicId:
    "0xfa67019f292323b49b589fc709d66c232c7b0ce022f3f32a39af2f91028bbf2c",
  networkAgnosticTransfer: true, // Set this to enable network agnostic gasless transactions
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/lpmanagermumbai',
  explorerUrl: 'https://mumbai.polygonscan.com',
};
