import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import ethIcon from "../../../assets/images/tokens/eth-icon.svg"

export const GOERLI: ChainConfig = {
  name: "Goerli",
  image: ethIcon,
  subText: "Ethereum testnet",
  chainId: 5,
  chainColor: "#C4C4C41A",
  rpcUrl: "https://goerli.infura.io/v3/d126f392798444609246423b06116c77",
  currency: "GETH",
  // currency: "Goerli ETH",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "https://faucet.goerli.mudit.blog/",
  assetSentTopicId:
    "0xfa67019f292323b49b589fc709d66c232c7b0ce022f3f32a39af2f91028bbf2c",
  biconomy: {
    enable: true,
    apiKey: "Ze_BIjFdZ.e5900961-0c16-4cb1-b4b7-604a5069daa8",
  },
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/lpmanagergoerli",
  networkAgnosticTransfer: false,
  explorerUrl: "https://goerli.etherscan.io",
};
