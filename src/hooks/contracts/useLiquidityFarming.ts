import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityFarmingABI from 'abis/LPToken.abi.json';
import { LiquidityFarming } from 'config/liquidityContracts/LiquidityFarming';
import { ChainConfig } from 'config/chains';

function useLiquidityFarming(chain: ChainConfig | undefined) {
  const contractAddress = chain
    ? LiquidityFarming[chain.chainId].address
    : undefined;

  const liquidityFarmingContract = useMemo(() => {
    if (!chain || !contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      liquidityFarmingABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrl),
    );
  }, [chain, contractAddress]);

  const getRewardsPerSecond = useCallback(
    (address: string) => {
      if (!liquidityFarmingContract) return;

      return liquidityFarmingContract.rewardsPerSecond(address);
    },
    [liquidityFarmingContract],
  );

  const getRewardTokenAddress = useCallback(
    (address: string) => {
      if (!liquidityFarmingContract) return;

      return liquidityFarmingContract.rewardTokens(address);
    },
    [liquidityFarmingContract],
  );

  return { getRewardsPerSecond, getRewardTokenAddress };
}

export default useLiquidityFarming;
