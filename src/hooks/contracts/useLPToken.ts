import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'abis/LPToken.abi.json';
import { useChains } from 'context/Chains';
import { LPToken } from 'config/liquidityContracts/LPToken';

function useLPToken() {
  const { fromChain } = useChains()!;
  const contractAddress = fromChain
    ? LPToken[fromChain.chainId].address
    : undefined;

  const lpTokenContract = useMemo(() => {
    if (!contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      lpTokenABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, [contractAddress]);

  const getPositionMetadata = useCallback(
    (positionId: BigNumber) => {
      if (!lpTokenContract) return;

      return lpTokenContract.tokenMetadata(positionId);
    },
    [lpTokenContract],
  );

  const getUserPositions = useCallback(
    (accounts: string[] | undefined) => {
      if (!lpTokenContract) return;

      return accounts
        ? lpTokenContract
            .getAllNftIdsByUser(accounts[0])
            .then((res: any) => res)
        : null;
    },
    [lpTokenContract],
  );

  return { getPositionMetadata, getUserPositions };
}

export default useLPToken;
