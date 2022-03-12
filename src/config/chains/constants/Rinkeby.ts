import { ChainConfig } from '..';
import { NATIVE_ADDRESS } from '../../constants';
import ethIcon from '../../../assets/images/tokens/eth-icon.svg';

export const RINKEBY: ChainConfig = {
  name: 'Rinkeby',
  image: ethIcon,
  subText: 'Ethereum testnet',
  chainId: 4,
  chainColor: '#C4C4C41A',
  rpcUrl: 'https://rinkeby.infura.io/v3/d126f392798444609246423b06116c77',
  currency: 'RETH',
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: 'https://rinkeby-faucet.com/',
  assetSentTopicId:
    '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',
  biconomy: {
    enable: false,
    apiKey: 'Ze_BIjFdZ.e5900961-0c16-4cb1-b4b7-604a5069daa8',
  },
  graphURL: 'https://api.thegraph.com/subgraphs/name/divyan73/hyphen-rinkeby',
  networkAgnosticTransfer: false,
  explorerUrl: 'https://rinkeby.etherscan.io',
};
