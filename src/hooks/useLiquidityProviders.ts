import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import { useWalletProvider } from 'context/WalletProvider';

function useLiquidityProviders() {
  const { signer } = useWalletProvider()!;

  const liquidityProvidersContract = useMemo(() => {
    return new ethers.Contract(
      '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
      liquidityProvidersABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const liquidityProvidersContractSigner = useMemo(() => {
    return new ethers.Contract(
      '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
      liquidityProvidersABI,
      signer,
    );
  }, [signer]);

  const addTokenLiquidity = useCallback(
    (tokenAddress: string, amount: BigNumber) => {
      return liquidityProvidersContractSigner.addTokenLiquidity(
        tokenAddress,
        amount,
      );
    },
    [liquidityProvidersContractSigner],
  );

  const getTokenAmount = useCallback(
    (shares: BigNumber, tokenAddress: string) => {
      return liquidityProvidersContract.sharesToTokenAmount(
        shares,
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
  );

  const getTokenPriceInLPShares = useCallback(
    (tokenAddress: string | undefined) => {
      return liquidityProvidersContract.getTokenPriceInLPShares(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalLiquidity = useCallback(
    (tokenAddress: string | undefined) => {
      return liquidityProvidersContract.totalReserve(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalSharesMinted = useCallback(
    (tokenAddress: string | undefined) => {
      return liquidityProvidersContract.totalSharesMinted(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const removeLiquidity = useCallback(
    (positionId: BigNumber, amount: BigNumber) => {
      return liquidityProvidersContractSigner.removeLiquidity(
        positionId,
        amount,
      );
    },
    [liquidityProvidersContractSigner],
  );

  return {
    liquidityProvidersContract,
    liquidityProvidersContractSigner,
    addTokenLiquidity,
    getTokenAmount,
    getTokenPriceInLPShares,
    getTotalLiquidity,
    getTotalSharesMinted,
    removeLiquidity,
  };
}

export default useLiquidityProviders;
