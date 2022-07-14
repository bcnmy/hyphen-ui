import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import liquidityFarmingABI from 'abis/LiquidityFarming.abi.json';
// V2 ABI for Liquidity Farming contract.
import liquidityFarmingABIV2 from 'abis/LiquidityFarmingV2.abi.json';
import { Network } from 'hooks/useNetworks';
import { useWalletProvider } from 'context/WalletProvider';

function useLiquidityFarming(chain: Network | undefined) {
  const { signer } = useWalletProvider()!;
  let contractAddress = '';
  if (chain) {
    if (chain.contracts.hyphen.liquidityFarmingV2) {
      contractAddress = chain.contracts.hyphen.liquidityFarmingV2;
    } else {
      contractAddress = chain.contracts.hyphen.liquidityFarmingV1;
    }
  }

  const liquidityFarmingContract = useMemo(() => {
    if (!chain || !contractAddress) return;

    // Check for new farming contract support and make
    // contract instance using V2 ABI.
    if (chain.contracts.hyphen.liquidityFarmingV2) {
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

    // Check for new farming contract support and make
    // signer instance using V2 ABI.
    if (chain.contracts.hyphen.liquidityFarmingV2) {
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
    (positionId: BigNumber, accounts: string[], rewardTokenAddress = '') => {
      if (!chain || !liquidityFarmingContractSigner || !positionId || !accounts)
        return;

      // Check for new farming contract support and call
      // liquidityFarmingContractSigner with reward token address.
      // TODO: Remove this when farming contracts
      // are upgraded for all networks.
      if (chain.contracts.hyphen.liquidityFarmingV2) {
        return liquidityFarmingContractSigner.extractRewards(
          positionId,
          rewardTokenAddress,
          accounts[0],
        );
      } else {
        return liquidityFarmingContractSigner.extractRewards(
          positionId,
          accounts[0],
        );
      }
    },
    [chain, liquidityFarmingContractSigner],
  );

  const getPendingToken = useCallback(
    (positionId: BigNumber, rewardTokenAddress = '') => {
      if (!chain || !liquidityFarmingContract) return;

      // Check for new farming contract support and call
      // pendingToken with reward token address.
      // TODO: Remove this when farming contracts
      // are upgraded for all networks.
      if (chain.contracts.hyphen.liquidityFarmingV2) {
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

      // Check for new farming contract support and call
      // getRewardRatePerSecond with reward token address.
      // TODO: Remove this when farming contracts
      // are upgraded for all networks.
      if (chain.contracts.hyphen.liquidityFarmingV2) {
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
      // Check for new farming contract support and call
      // function getRewardTokens(address _baseToken) -> address[]
      // Use the first address for now.
      // TODO: Handle multiple reward tokens later.
      if (chain.contracts.hyphen.liquidityFarmingV2) {
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
