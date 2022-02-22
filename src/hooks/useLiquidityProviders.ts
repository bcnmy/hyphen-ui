import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'contracts/LiquidityProviders.abi.json';

function useLiquidityProviders() {
  const liquidityProvidersContract = useMemo(() => {
    return new ethers.Contract(
      '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
      liquidityProvidersABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const getTokenAmount = useCallback(
    (shares: BigNumber, tokenAddress: string) => {
      return liquidityProvidersContract.sharesToTokenAmount(
        shares,
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
  );

  const getTotalLiquidity = useCallback(
    (tokenAddress: string | undefined) => {
      return liquidityProvidersContract.totalReserve(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  return { liquidityProvidersContract, getTokenAmount, getTotalLiquidity };
}

export default useLiquidityProviders;
