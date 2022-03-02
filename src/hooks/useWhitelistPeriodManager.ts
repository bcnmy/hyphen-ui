import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import whitelistPeriodManagerABI from 'abis/WhitelistPeriodManager.abi.json';

function useWhitelistPeriodManager() {
  const whitelistPeriodManagerContract = useMemo(() => {
    return new ethers.Contract(
      '0x6fa46880fC890EBa8c87A7DfBB5c5854771E3B69',
      whitelistPeriodManagerABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const getTokenTotalCap = useCallback(
    (tokenAddress: string | undefined) => {
      return whitelistPeriodManagerContract.perTokenTotalCap(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  const getTokenWalletCap = useCallback(
    (tokenAddress: string | undefined) => {
      return whitelistPeriodManagerContract.perTokenWalletCap(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  const getTotalLiquidityByLp = useCallback(
    (tokenAddress: string | undefined, accounts: string[] | undefined) => {
      return whitelistPeriodManagerContract.totalLiquidityByLp(
        tokenAddress,
        accounts?.[0],
      );
    },
    [whitelistPeriodManagerContract],
  );

  return {
    whitelistPeriodManagerContract,
    getTokenTotalCap,
    getTokenWalletCap,
    getTotalLiquidityByLp,
  };
}

export default useWhitelistPeriodManager;
