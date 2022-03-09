import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'abis/LPToken.abi.json';
import { LPToken } from 'config/liquidityContracts/LPToken';
import { ChainConfig } from 'config/chains';

function useLPToken(chain: ChainConfig | undefined) {
  const contractAddress = chain ? LPToken[chain.chainId].address : undefined;

  const lpTokenContract = useMemo(() => {
    if (!chain || !contractAddress) return;

    return new ethers.Contract(
      contractAddress,
      lpTokenABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrl),
    );
  }, [chain, contractAddress]);

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
