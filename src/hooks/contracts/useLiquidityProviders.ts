import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import { useWalletProvider } from 'context/WalletProvider';
import { LiquidityProviders } from 'config/liquidityContracts/LiquidityProviders';
import { ChainConfig } from 'config/chains';

function useLiquidityProviders(chain: ChainConfig | undefined) {
  const { isLoggedIn, signer } = useWalletProvider()!;
  const contractAddress = chain
    ? LiquidityProviders[chain.chainId].address
    : undefined;

  const liquidityProvidersContract = useMemo(() => {
    if (!chain || !contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      liquidityProvidersABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrl),
    );
  }, [chain, contractAddress]);

  const liquidityProvidersContractSigner = useMemo(() => {
    if (!contractAddress || !isLoggedIn) return;

    return new ethers.Contract(contractAddress, liquidityProvidersABI, signer);
  }, [contractAddress, isLoggedIn, signer]);

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
