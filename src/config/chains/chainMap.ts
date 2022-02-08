import { AVALANCHE } from "./constants/Avalanche";
import { ETHEREUM } from "./constants/Ethereum";
import { FUJI } from "./constants/Fuji";
import { GOERLI } from "./constants/Goerli";
import { MUMBAI } from "./constants/Mumbai";
import { POLYGON } from "./constants/Polygon";
import { RINKEBY } from "./constants/Rinkeby";

const chainPairs = [
  [AVALANCHE, ETHEREUM],
  [AVALANCHE, POLYGON],
  [ETHEREUM, POLYGON],
  [FUJI, RINKEBY],
  [GOERLI, MUMBAI],
];

// TODO: REVERT BEFORE DEPLOY!
export const chainMap = chainPairs.reduce((acc, pair) => {
  acc[pair[0].chainId] = [...(acc[pair[0].chainId] || []), pair[0].chainId, pair[1].chainId];
  acc[pair[1].chainId] = [...(acc[pair[1].chainId] || []), pair[1].chainId, pair[0].chainId];
  return acc;
}, {} as ChainMap)

// {
//   1: [143, 2002],
//   2: [...]
// }

export type ChainMap = { [fromChainId: number]: number[] };

