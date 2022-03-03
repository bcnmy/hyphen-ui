import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import avaxIcon from "../../../assets/images/tokens/avax-icon.svg"

export const AVALANCHE: ChainConfig = {
  name: "Avalanche",
  image: avaxIcon,
  subText: "Avalanche mainnet",
  chainId: 43114,
  chainColor: "#E841421A",
  rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  currency: "AVAX",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "",
  biconomy: {
    enable: false,
    apiKey: "jndkOSkVO.e9e51b91-ded9-4371-8eba-c5e8c7ec84d7",
  },
  assetSentTopicId:
    "0xfa67019f292323b49b589fc709d66c232c7b0ce022f3f32a39af2f91028bbf2c",
  networkAgnosticTransfer: false, // Set this to enable network agnostic gasless transactions
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphen-avalanche",
  explorerUrl: "https://snowtrace.io"
};
