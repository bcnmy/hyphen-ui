import { ENV } from "../../types/environment";
import { chainMap } from "./chainMap";

import { MUMBAI } from "./constants/Mumbai";
import { AVALANCHE } from "./constants/Avalanche";
import { GOERLI } from "./constants/Goerli";
import { FUJI } from "./constants/Fuji";
import { RINKEBY } from "./constants/Rinkeby";
import { ETHEREUM } from "./constants/Ethereum";
import { POLYGON } from "./constants/Polygon";

export type ChainConfig = {
  name: string;
  subText: string;
  chainId: number;
  rpcUrl: string;
  currency: string;
  nativeDecimal: number;
  nativeToken: string;
  nativeFaucetURL: string;
  biconomy: {
    enable: boolean;
    apiKey: string;
  };
  assetSentTopicId: string;
  networkAgnosticTransfer: boolean;
  graphURL: string;
  explorerUrl: string;
};

export let chains: ChainConfig[];
export { chainMap };

if (process.env.REACT_APP_ENV === ENV.test) {
  chains = [MUMBAI, GOERLI, FUJI, RINKEBY];
} else if (process.env.REACT_APP_ENV === ENV.production) {
  chains = [POLYGON, ETHEREUM, AVALANCHE];
} else if (process.env.REACT_APP_ENV === ENV.staging) {
  chains = [MUMBAI, GOERLI, FUJI, RINKEBY];
} else {
  chains = [MUMBAI, GOERLI, FUJI, RINKEBY];
}
