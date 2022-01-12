import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import maticLogo from "../../../assets/images/chains/matic-logo.svg"

export const MUMBAI: ChainConfig = {
  name: "Mumbai",
  image: maticLogo,
  subText: "Polygon testnet",
  chainId: 80001,
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  currency: "Test MATIC",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "https://faucet.matic.network/",
  biconomy: {
    enable: true,
    apiKey: "r8N3i0Ukw.bb5dd97d-af25-47cb-9281-2069f1b95ade",
  },
  assetSentTopicId:
    "0xec1dcc5633614eade4a5730f51adc7444a5103a8477965a32f2e886f5b20f694",
  networkAgnosticTransfer: true, // Set this to enable network agnostic gasless transactions
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/lpmanagermumbai",
  explorerUrl: "https://mumbai.polygonscan.com",
};
