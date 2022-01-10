import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";

export const AVALANCHE: ChainConfig = {
  name: "Avalanche",
  subText: "Avalanche mainnet",
  chainId: 43114,
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
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  networkAgnosticTransfer: false, // Set this to enable network agnostic gasless transactions
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphen-avalanche",
  explorerUrl: "https://snowtrace.io"
};
