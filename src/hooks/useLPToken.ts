import { useCallback, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import lpTokenABI from 'contracts/LPToken.abi.json';

function useLPToken() {
  const lpTokenContract = useMemo(() => {
    return new ethers.Contract(
      '0xF9e13773D10C0ec25369CC4C0fAEef05eC00B18b',
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
