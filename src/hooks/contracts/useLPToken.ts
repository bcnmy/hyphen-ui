import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'abis/LPToken.abi.json';
import { useChains } from 'context/Chains';
import { LPToken } from 'config/liquidityContracts/LPToken';
import { useWalletProvider } from 'context/WalletProvider';

function useLPToken() {
  const { isLoggedIn } = useWalletProvider()!;
  const { fromChain } = useChains()!;
  const contractAddress = fromChain
    ? LPToken[fromChain.chainId].address
    : undefined;

  const lpTokenContract = useMemo(() => {
    if (!contractAddress || !isLoggedIn) return;

    return new ethers.Contract(
      contractAddress,
      lpTokenABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, [contractAddress, isLoggedIn]);

  const getPositionMetadata = useCallback(
    (positionId: BigNumber) => {
      if (!lpTokenContract) return;

      return lpTokenContract.tokenMetadata(positionId);
    },
    [lpTokenContract],
  );

  const getUserPositions = useCallback(
    (accounts: string[]) => {
      if (!lpTokenContract) return;

      return lpTokenContract.getAllNftIdsByUser(accounts[0]);
    },
    [lpTokenContract],
  );

  return { getPositionMetadata, getUserPositions };
}

export default useLPToken;
