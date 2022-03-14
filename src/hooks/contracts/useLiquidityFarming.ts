import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import liquidityFarmingABI from 'abis/LiquidityFarming.abi.json';
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

  const getRewardRatePerSecond = useCallback(
    (address: string) => {
      if (!liquidityFarmingContract) return;

      return liquidityFarmingContract.getRewardRatePerSecond(address);
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

  const getTotalSharesStaked = useCallback(
    (address: string) => {
      if (!liquidityFarmingContract) return;

      return liquidityFarmingContract.totalSharesStaked(address);
    },
    [liquidityFarmingContract],
  );

  return {
    getRewardRatePerSecond,
    getRewardTokenAddress,
    getTotalSharesStaked,
  };
}

export default useLiquidityFarming;
