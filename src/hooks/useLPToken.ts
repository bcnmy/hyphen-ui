import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'abis/LPToken.abi.json';

function useLPToken() {
  const lpTokenContract = useMemo(() => {
    return new ethers.Contract(
      '0x14aC2F6eeAC5ED94667Ca9f4f3c5f449b733325f',
      lpTokenABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const getPositionMetadata = useCallback(
    (positionId: BigNumber) => {
      return lpTokenContract.tokenMetadata(positionId);
    },
    [lpTokenContract],
  );

  const getUserPositions = useCallback(
    (accounts: string[] | undefined) => {
      return accounts
        ? lpTokenContract
            .getAllNftIdsByUser(accounts[0])
            .then((res: any) => res)
        : null;
    },
    [lpTokenContract],
  );

  return { lpTokenContract, getPositionMetadata, getUserPositions };
}

export default useLPToken;
