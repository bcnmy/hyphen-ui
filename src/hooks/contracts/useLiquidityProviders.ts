import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import { useWalletProvider } from 'context/WalletProvider';
import { useChains } from 'context/Chains';
import { LiquidityProviders } from 'config/liquidityContracts/LiquidityProviders';

function useLiquidityProviders() {
  const { signer } = useWalletProvider()!;
  const { fromChain } = useChains()!;
  const contractAddress = fromChain
    ? LiquidityProviders[fromChain.chainId].address
    : undefined;

  const liquidityProvidersContract = useMemo(() => {
    if (!contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      liquidityProvidersABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, [contractAddress]);

  const liquidityProvidersContractSigner = useMemo(() => {
    if (!contractAddress) return;

    return new ethers.Contract(contractAddress, liquidityProvidersABI, signer);
  }, [contractAddress, signer]);

  const addLiquidity = useCallback(
    (tokenAddress: string, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.addTokenLiquidity(
        tokenAddress,
        amount,
      );
    },
    [liquidityProvidersContractSigner],
  );

  const addNativeLiquidity = useCallback(
    (amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.addNativeLiquidity({
        value: amount,
      });
    },
    [liquidityProvidersContractSigner],
  );

  const claimFee = useCallback(
    (positionId: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.claimFee(positionId);
    },
    [liquidityProvidersContractSigner],
  );

  const getTokenAmount = useCallback(
    (shares: BigNumber, tokenAddress: string) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.sharesToTokenAmount(
        shares,
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
  );

  const getTokenPriceInLPShares = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.getTokenPriceInLPShares(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalLiquidity = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.totalReserve(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const getTotalSharesMinted = useCallback(
    (tokenAddress: string | undefined) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.totalSharesMinted(tokenAddress);
    },
    [liquidityProvidersContract],
  );

  const increaseLiquidity = useCallback(
    (positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.increaseTokenLiquidity(
        positionId,
        amount,
      );
    },
    [liquidityProvidersContractSigner],
  );

  const increaseNativeLiquidity = useCallback(
    (positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.increaseNativeLiquidity(
        positionId,
        {
          value: amount,
        },
      );
    },
    [liquidityProvidersContractSigner],
  );

  const removeLiquidity = useCallback(
    (positionId: BigNumber, amount: BigNumber) => {
      if (!liquidityProvidersContractSigner) return;

      return liquidityProvidersContractSigner.removeLiquidity(
        positionId,
        amount,
      );
    },
    [liquidityProvidersContractSigner],
  );

  return {
    addLiquidity,
    addNativeLiquidity,
    claimFee,
    getTokenAmount,
    getTokenPriceInLPShares,
    getTotalLiquidity,
    getTotalSharesMinted,
    increaseLiquidity,
    increaseNativeLiquidity,
    removeLiquidity,
  };
}

export default useLiquidityProviders;
