import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityProvidersABI from 'abis/LiquidityProviders.abi.json';
import { useWalletProvider } from 'context/WalletProvider';
import { Network } from 'hooks/useNetworks';

function useLiquidityProviders(chain: Network | undefined) {
  const { signer } = useWalletProvider()!;
  const contractAddress = chain
    ? chain.contracts.hyphen.liquidityProviders
    : undefined;

  const liquidityProvidersContract = useMemo(() => {
    if (!chain || !contractAddress || !chain.rpc) return;

    return new ethers.Contract(
      contractAddress,
      liquidityProvidersABI,
      new ethers.providers.JsonRpcProvider(chain.rpc),
    );
  }, [chain, contractAddress]);

  const liquidityProvidersContractSigner = useMemo(() => {
    if (!contractAddress || !signer) return;

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

  const getBaseDivisor = useCallback(() => {
    if (!liquidityProvidersContract) return;

    return liquidityProvidersContract.BASE_DIVISOR();
  }, [liquidityProvidersContract]);

  const getSuppliedLiquidityByToken = useCallback(
    (tokenAddress: string) => {
      if (!liquidityProvidersContract) return;

      return liquidityProvidersContract.getSuppliedLiquidityByToken(
        tokenAddress,
      );
    },
    [liquidityProvidersContract],
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

      return liquidityProvidersContract.totalLiquidity(tokenAddress);
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
    getBaseDivisor,
    getSuppliedLiquidityByToken,
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
