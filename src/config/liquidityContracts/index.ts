import { LiquidityPool } from './liquidityPool';
import { LiquidityProvider } from './LiquidityProvider';
import { LPToken } from './LPToken';
import { WhitelistPeriodManager } from './WhitelistPeriodManager';

export type LiquidityContractConfig = {
  name: string;
  [chainId: number]: {
    address: string;
  };
};

export const liquidityContracts = [
  LiquidityPool,
  LiquidityProvider,
  LPToken,
  WhitelistPeriodManager,
].reduce((accumulator, currentValue) => {
  const { name } = currentValue;

  return {
    ...accumulator,
    [name]: currentValue,
  };
}, {});

export default liquidityContracts;
