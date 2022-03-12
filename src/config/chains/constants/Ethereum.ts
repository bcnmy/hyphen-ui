import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import ethIcon from "../../../assets/images/tokens/eth-icon.svg"

export const ETHEREUM: ChainConfig = {
  name: "Ethereum",
  image: ethIcon,
  subText: "Ethereum Mainnet",
  chainId: 1,
  chainColor: "#C4C4C41A",
  rpcUrl: "https://mainnet.infura.io/v3/d126f392798444609246423b06116c77",
  currency: "ETH",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "",
  assetSentTopicId:
    "0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c",
  biconomy: {
    enable: false,
    apiKey: "fWz3rAdDl.44d92a99-9ca4-47b1-98ca-aa2bae068e38",
  },
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphenethereumv2",
  networkAgnosticTransfer: false,
  explorerUrl: "https://etherscan.io/",
};
