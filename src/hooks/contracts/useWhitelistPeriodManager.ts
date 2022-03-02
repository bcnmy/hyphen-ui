import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import whitelistPeriodManagerABI from 'abis/WhitelistPeriodManager.abi.json';
import { useChains } from 'context/Chains';
import { WhitelistPeriodManager } from 'config/liquidityContracts/WhitelistPeriodManager';

function useWhitelistPeriodManager() {
  const { fromChain } = useChains()!;
  const contractAddress = fromChain
    ? WhitelistPeriodManager[fromChain.chainId].address
    : undefined;

  const whitelistPeriodManagerContract = useMemo(() => {
    if (!contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      whitelistPeriodManagerABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, [contractAddress]);

  const getTokenTotalCap = useCallback(
    (tokenAddress: string | undefined) => {
      if (!whitelistPeriodManagerContract) return;

      return whitelistPeriodManagerContract.perTokenTotalCap(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  const getTokenWalletCap = useCallback(
    (tokenAddress: string | undefined) => {
      if (!whitelistPeriodManagerContract) return;

      return whitelistPeriodManagerContract.perTokenWalletCap(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  const getTotalLiquidityByLp = useCallback(
    (tokenAddress: string | undefined, accounts: string[] | undefined) => {
      if (!whitelistPeriodManagerContract) return;

      return whitelistPeriodManagerContract.totalLiquidityByLp(
        tokenAddress,
        accounts?.[0],
      );
    },
    [whitelistPeriodManagerContract],
  );

  return {
    getTokenTotalCap,
    getTokenWalletCap,
    getTotalLiquidityByLp,
  };
}

export default useWhitelistPeriodManager;
