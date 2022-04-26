import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import liquidityPoolABI from 'abis/LiquidityPools.abi.json';
import { useWalletProvider } from 'context/WalletProvider';
import { LiquidityPool } from 'config/liquidityContracts/LiquidityPool';
import { Network } from 'hooks/useNetworks';

function useLiquidityPools(chain: Network | undefined) {
  const { isLoggedIn, signer } = useWalletProvider()!;
  const contractAddress = chain
    ? LiquidityPool[chain.chainId].address
    : undefined;

  const liquidityPoolsContract = useMemo(() => {
    if (!contractAddress || !isLoggedIn || !chain || !chain.rpc) return;

    return new ethers.Contract(
      contractAddress,
      liquidityPoolABI,
      new ethers.providers.JsonRpcProvider(chain.rpc),
    );
  }, [chain, contractAddress, isLoggedIn]);

  const liquidityPoolsContractSigner = useMemo(() => {
    if (!contractAddress || !isLoggedIn) return;

    return new ethers.Contract(contractAddress, liquidityPoolABI, signer);
  }, [contractAddress, isLoggedIn, signer]);

  const getTransferFee = useCallback(
    async (tokenAddress: string, rawTransferAmount: string) => {
      if (!liquidityPoolsContract) return;
      return await liquidityPoolsContract.getTransferFee(
        tokenAddress,
        rawTransferAmount,
      );
    },
    [liquidityPoolsContract],
  );

  const getRewardAmount = useCallback(
    (tokenAddress: string, rawDepositAmount: string) => {
      if (!liquidityPoolsContract) return;
      return liquidityPoolsContract.getRewardAmount(
        rawDepositAmount,
        tokenAddress,
      );
    },
    [liquidityPoolsContract],
  );

  // const addLiquidity = useCallback(
  //   (tokenAddress: string, amount: BigNumber) => {
  //     return liquidityProvidersContractSigner.addTokenLiquidity(
  //       tokenAddress,
  //       amount,
  //     );
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  // const addNativeLiquidity = useCallback(
  //   (amount: BigNumber) => {
  //     return liquidityProvidersContractSigner.addNativeLiquidity({
  //       value: amount,
  //     });
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  // const claimFee = useCallback(
  //   (positionId: BigNumber) => {
  //     return liquidityProvidersContractSigner.claimFee(positionId);
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  // const getTokenAmount = useCallback(
  //   (shares: BigNumber, tokenAddress: string) => {
  //     return liquidityProvidersContract.sharesToTokenAmount(
  //       shares,
  //       tokenAddress,
  //     );
  //   },
  //   [liquidityProvidersContract],
  // );

  // const getTokenPriceInLPShares = useCallback(
  //   (tokenAddress: string | undefined) => {
  //     return liquidityProvidersContract.getTokenPriceInLPShares(tokenAddress);
  //   },
  //   [liquidityProvidersContract],
  // );

  // const getTotalLiquidity = useCallback(
  //   (tokenAddress: string | undefined) => {
  //     return liquidityProvidersContract.totalReserve(tokenAddress);
  //   },
  //   [liquidityProvidersContract],
  // );

  // const getTotalSharesMinted = useCallback(
  //   (tokenAddress: string | undefined) => {
  //     return liquidityProvidersContract.totalSharesMinted(tokenAddress);
  //   },
  //   [liquidityProvidersContract],
  // );

  // const increaseLiquidity = useCallback(
  //   (positionId: BigNumber, amount: BigNumber) => {
  //     return liquidityProvidersContractSigner.increaseTokenLiquidity(
  //       positionId,
  //       amount,
  //     );
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  // const increaseNativeLiquidity = useCallback(
  //   (positionId: BigNumber, amount: BigNumber) => {
  //     return liquidityProvidersContractSigner.increaseNativeLiquidity(
  //       positionId,
  //       {
  //         value: amount,
  //       },
  //     );
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  // const removeLiquidity = useCallback(
  //   (positionId: BigNumber, amount: BigNumber) => {
  //     return liquidityProvidersContractSigner.removeLiquidity(
  //       positionId,
  //       amount,
  //     );
  //   },
  //   [liquidityProvidersContractSigner],
  // );

  return {
    liquidityProvidersContract: liquidityPoolsContract,
    liquidityProvidersContractSigner: liquidityPoolsContractSigner,
    getTransferFee,
    getRewardAmount,
    // addLiquidity,
    // addNativeLiquidity,
    // claimFee,
    // getTokenAmount,
    // getTokenPriceInLPShares,
    // getTotalLiquidity,
    // getTotalSharesMinted,
    // increaseLiquidity,
    // increaseNativeLiquidity,
    // removeLiquidity,
  };
}

export default useLiquidityPools;
