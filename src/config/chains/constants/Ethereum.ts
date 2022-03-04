import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import ethIcon from "../../../assets/images/tokens/eth-icon.svg"

export const ETHEREUM: ChainConfig = {
  name: "Ethereum",
  image: ethIcon,
  subText: "Ethereum Mainnet",
  chainId: 1,
  rpcUrl: "https://eth-mainnet.alchemyapi.io/v2/wO7WAmNPAsZFhRlpd-xYjM-5Pl5Dx8-G",
  currency: "ETH",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "",
  assetSentTopicId:
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  biconomy: {
    enable: false,
    apiKey: "fWz3rAdDl.44d92a99-9ca4-47b1-98ca-aa2bae068e38",
  },
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphenethereumv2",
  networkAgnosticTransfer: false,
  explorerUrl: "https://etherscan.io/",
};
