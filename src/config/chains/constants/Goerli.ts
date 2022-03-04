import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import ethIcon from "../../../assets/images/tokens/eth-icon.svg"

export const GOERLI: ChainConfig = {
  name: "Goerli",
  image: ethIcon,
  subText: "Ethereum testnet",
  chainId: 5,
  rpcUrl: "https://eth-goerli.alchemyapi.io/v2/meF8z-onSwabyq4wsaR0ApbqV9vrYDpn",
  currency: "GETH",
  // currency: "Goerli ETH",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "https://faucet.goerli.mudit.blog/",
  assetSentTopicId:
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  biconomy: {
    enable: true,
    apiKey: "Ze_BIjFdZ.e5900961-0c16-4cb1-b4b7-604a5069daa8",
  },
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/lpmanagergoerli",
  networkAgnosticTransfer: false,
  explorerUrl: "https://goerli.etherscan.io",
};
