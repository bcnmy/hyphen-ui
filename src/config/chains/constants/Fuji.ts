import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";

export const FUJI: ChainConfig = {
  name: "Fuji",
  subText: "Avalanche testnet",
  chainId: 43113,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  currency: "Test AVAX",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "https://faucet.avax-test.network/",
  biconomy: {
    enable: true,
    apiKey: "CdOSOVUtJ.f50d832e-1e7c-45f6-9a2e-9aefc4fc8b56",
  },
  assetSentTopicId:
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  networkAgnosticTransfer: true, // Set this to enable network agnostic gasless transactions
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphen-fuji",
  explorerUrl: "https://testnet.snowtrace.io",
};
