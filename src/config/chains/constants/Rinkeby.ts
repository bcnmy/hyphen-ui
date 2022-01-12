import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import ethLogo from "../../../assets/images/chains/eth-logo.svg"

export const RINKEBY: ChainConfig = {
  name: "Rinkeby",
  image: ethLogo,
  subText: "Ethereum testnet",
  chainId: 4,
  rpcUrl: "https://rinkeby.infura.io/v3/d126f392798444609246423b06116c77",
  currency: "Rinkeby ETH",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "https://rinkeby-faucet.com/",
  assetSentTopicId:
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  biconomy: {
    enable: true,
    apiKey: "Ze_BIjFdZ.e5900961-0c16-4cb1-b4b7-604a5069daa8",
  },
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphen-rinkeby",
  networkAgnosticTransfer: false,
  explorerUrl: "https://rinkeby.etherscan.io",
};
