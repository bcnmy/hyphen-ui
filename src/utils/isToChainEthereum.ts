const ETH_CHAIN_IDS = [1, 5];

export default function isToChainEthereum(chainId: number): boolean {
  return ETH_CHAIN_IDS.includes(chainId);
}
