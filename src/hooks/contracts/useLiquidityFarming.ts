import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityFarmingABI from 'abis/LiquidityFarming.abi.json';
import liquidityFarmingABIV2 from 'abis/LiquidityFarmingV2.abi.json';
import { Network } from 'hooks/useNetworks';
import { useWalletProvider } from 'context/WalletProvider';
import { OPTIMISM_CHAIN_ID } from 'config/constants';

function useLiquidityFarming(chain: Network | undefined) {
  const { signer } = useWalletProvider()!;
  const contractAddress = chain
    ? chain.contracts.hyphen.liquidityFarming
    : undefined;

  const liquidityFarmingContract = useMemo(() => {
    if (!chain || !contractAddress) return;

    const { chainId } = chain;
    if (chainId === OPTIMISM_CHAIN_ID) {
      return new ethers.Contract(
        contractAddress,
        liquidityFarmingABIV2,
        new ethers.providers.JsonRpcProvider(chain.rpc),
      );
    } else {
      return new ethers.Contract(
        contractAddress,
        liquidityFarmingABI,
        new ethers.providers.JsonRpcProvider(chain.rpc),
      );
    }
  }, [chain, contractAddress]);

  const liquidityFarmingContractSigner = useMemo(() => {
    if (!chain || !contractAddress || !signer) return;

    const { chainId } = chain;
    if (chainId === OPTIMISM_CHAIN_ID) {
      return new ethers.Contract(
        contractAddress,
        liquidityFarmingABIV2,
        signer,
      );
    } else {
      return new ethers.Contract(contractAddress, liquidityFarmingABI, signer);
    }
  }, [chain, contractAddress, signer]);

  const claimFee = useCallback(
    (positionId: BigNumber, accounts: string[]) => {
      if (!liquidityFarmingContractSigner || !positionId || !accounts) return;

      return liquidityFarmingContractSigner.extractRewards(
        positionId,
        accounts[0],
      );
    },
    [liquidityFarmingContractSigner],
  );

  const getPendingToken = useCallback(
    (positionId: BigNumber, rewardTokenAddress = '') => {
      if (!chain || !liquidityFarmingContract) return;

      const { chainId } = chain;
      if (chainId === OPTIMISM_CHAIN_ID) {
        return liquidityFarmingContract.pendingToken(
          positionId,
          rewardTokenAddress,
        );
      } else {
        return liquidityFarmingContract.pendingToken(positionId);
      }
    },
    [chain, liquidityFarmingContract],
  );

  const getStakedUserPositions = useCallback(
    (accounts: string[]) => {
      if (!liquidityFarmingContract || !accounts) return;

      return liquidityFarmingContract.getNftIdsStaked(accounts[0]);
    },
    [liquidityFarmingContract],
  );

  const getRewardRatePerSecond = useCallback(
    (address: string, rewardTokenAddress = '') => {
      if (!chain || !liquidityFarmingContract) return;

      const { chainId } = chain;
      if (chainId === OPTIMISM_CHAIN_ID) {
        return liquidityFarmingContract.getRewardRatePerSecond(
          address,
          rewardTokenAddress,
        );
      } else {
        return liquidityFarmingContract.getRewardRatePerSecond(address);
      }
    },
    [chain, liquidityFarmingContract],
  );

  const getRewardTokenAddress = useCallback(
    (address: string) => {
      if (!chain || !liquidityFarmingContract) return;
      // TODO: Check for Optimism ChainID and call
      // function getRewardTokens(address _baseToken) -> address[]
      // Use the first address for now.
      // TODO: Handle multiple reward tokens later.

      const { chainId } = chain;
      // If chain is Optimism testnet or mainnet, use the new function.
      if (chainId === OPTIMISM_CHAIN_ID) {
        return liquidityFarmingContract.getRewardTokens(address);
      } else {
        return liquidityFarmingContract.rewardTokens(address);
      }
    },
    [chain, liquidityFarmingContract],
  );

  const getTotalSharesStaked = useCallback(
    (address: string) => {
      if (!liquidityFarmingContract) return;

      return liquidityFarmingContract.totalSharesStaked(address);
    },
    [liquidityFarmingContract],
  );

  const stakeNFT = useCallback(
    (positionId: BigNumber, accounts: string[]) => {
      if (!liquidityFarmingContractSigner || !positionId || !accounts) return;

      return liquidityFarmingContractSigner.deposit(positionId, accounts[0]);
    },
    [liquidityFarmingContractSigner],
  );

  const unstakeNFT = useCallback(
    (positionId: BigNumber, accounts: string[]) => {
      if (!liquidityFarmingContractSigner || !positionId || !accounts) return;

      return liquidityFarmingContractSigner.withdraw(positionId, accounts[0]);
    },
    [liquidityFarmingContractSigner],
  );

  return {
    claimFee,
    getPendingToken,
    getStakedUserPositions,
    getRewardRatePerSecond,
    getRewardTokenAddress,
    getTotalSharesStaked,
    stakeNFT,
    unstakeNFT,
  };
}

export default useLiquidityFarming;
