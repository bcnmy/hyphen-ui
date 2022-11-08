import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import whitelistPeriodManagerABI from 'abis/WhitelistPeriodManager.abi.json';
import { Network } from 'hooks/useNetworks';

function useWhitelistPeriodManager(chain: Network | undefined) {
  const contractAddress = chain
    ? chain.contracts.hyphen.whitelistPeriodManager
    : undefined;

  const whitelistPeriodManagerContract = useMemo(() => {
    if (!chain || !contractAddress || !chain.rpc) return;

    return new ethers.Contract(
      contractAddress,
      whitelistPeriodManagerABI,
      new ethers.providers.JsonRpcProvider(chain.rpc),
    );
  }, [chain, contractAddress]);

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
    (tokenAddress: string | undefined, accounts: string[] | null) => {
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
