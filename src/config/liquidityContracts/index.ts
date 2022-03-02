export type LiquidityContractConfig = {
  name: string;
  [chainId: number]: {
    address: string;
  };
};
