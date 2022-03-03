import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import whitelistPeriodManagerABI from 'abis/WhitelistPeriodManager.abi.json';
import { WhitelistPeriodManager } from 'config/liquidityContracts/WhitelistPeriodManager';
import { useWalletProvider } from 'context/WalletProvider';
import { ChainConfig } from 'config/chains';

function useWhitelistPeriodManager(chain: ChainConfig | undefined) {
  const { isLoggedIn } = useWalletProvider()!;
  const contractAddress = chain
    ? WhitelistPeriodManager[chain.chainId].address
    : undefined;

  const whitelistPeriodManagerContract = useMemo(() => {
    if (!chain || !contractAddress || !isLoggedIn) return;

    return new ethers.Contract(
      contractAddress,
      whitelistPeriodManagerABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrl),
    );
  }, [chain, contractAddress, isLoggedIn]);

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
