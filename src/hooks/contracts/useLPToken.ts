import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'abis/LPToken.abi.json';
import { LPToken } from 'config/liquidityContracts/LPToken';
import { ChainConfig } from 'config/chains';
import { useWalletProvider } from 'context/WalletProvider';

function useLPToken(chain: ChainConfig | undefined) {
  const { signer } = useWalletProvider()!;
  const contractAddress = chain ? LPToken[chain.chainId].address : undefined;

  const lpTokenContract = useMemo(() => {
    if (!contractAddress || !chain) return;

    return new ethers.Contract(
      contractAddress,
      lpTokenABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrl),
    );
  }, [chain, contractAddress]);

  const lpTokenContractSigner = useMemo(() => {
    if (!contractAddress || !signer) return;

    return new ethers.Contract(contractAddress, lpTokenABI, signer);
  }, [contractAddress, signer]);

  const getNFTApprovalAddress = useCallback(
    (positionId: BigNumber) => {
      if (!lpTokenContract || !positionId) return;

      return lpTokenContract.getApproved(positionId);
    },
    [lpTokenContract],
  );

  const getNFTApproval = useCallback(
    (address: string, positionId: BigNumber) => {
      if (!lpTokenContractSigner || !address || !positionId) return;

      return lpTokenContractSigner.approve(address, positionId);
    },
    [lpTokenContractSigner],
  );

  const getPositionMetadata = useCallback(
    (positionId: BigNumber) => {
      if (!lpTokenContract || !positionId) return;

      return lpTokenContract.tokenMetadata(positionId);
    },
    [lpTokenContract],
  );

  const getTokenURI = useCallback(
    (positionId: BigNumber) => {
      if (!lpTokenContract || !positionId) return;

      return lpTokenContract.tokenURI(positionId);
    },
    [lpTokenContract],
  );

  const getUserPositions = useCallback(
    (accounts: string[]) => {
      if (!lpTokenContract || !accounts) return;

      return lpTokenContract.getAllNftIdsByUser(accounts[0]);
    },
    [lpTokenContract],
  );

  return {
    getNFTApprovalAddress,
    getNFTApproval,
    getPositionMetadata,
    getTokenURI,
    getUserPositions,
  };
}

export default useLPToken;
