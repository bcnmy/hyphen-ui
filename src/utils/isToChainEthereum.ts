import { GOERLI } from "../config/chains/constants/Goerli";
import { RINKEBY } from "../config/chains/constants/Rinkeby";
import { ETHEREUM } from "../config/chains/constants/Ethereum";

export default function isToChainEthereum(chainId: number): boolean {
  const ethereumChains = [GOERLI.chainId, RINKEBY.chainId, ETHEREUM.chainId];
  return ethereumChains.includes(chainId);
}