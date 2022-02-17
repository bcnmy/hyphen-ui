import { useEffect, useMemo, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import Skeleton from 'react-loading-skeleton';
import { useChains } from 'context/Chains';
import AssetOverview from '../../AssetOverview';
import lpTokenABI from 'contracts/LPToken.abi.json';
import liquidityProvidersABI from 'contracts/LiquidityProviders.abi.json';
import { useWalletProvider } from 'context/WalletProvider';

function YourPositions() {
  const { accounts } = useWalletProvider()!;
  const { fromChainRpcUrlProvider } = useChains()!;
  const lpTokenContract = useMemo(() => {
    return new ethers.Contract(
      '0xF9e13773D10C0ec25369CC4C0fAEef05eC00B18b',
      lpTokenABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);
  const liquidityProvidersContract = useMemo(() => {
    return new ethers.Contract(
      '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
      liquidityProvidersABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  function getUserPositions() {
    return lpTokenContract
      .getAllNftIdsByUser(accounts?.[0])
      .then((res: any) => res);
  }

  function getPositionMetadata(positionId: BigNumber) {
    return lpTokenContract.tokenMetadata(positionId);
  }

  function getTotalLiquidity(tokenAddress: string) {
    return liquidityProvidersContract.totalReserve(tokenAddress);
  }

  function getTokenAmount(shares: BigNumber, tokenAddress: string) {
    return liquidityProvidersContract.sharesToTokenAmount(shares, tokenAddress);
  }

  const {
    isLoading,
    isError,
    data: userPositions,
  } = useQuery('userPositions', getUserPositions, {
    // Execute only when accounts are available.
    enabled: !!accounts,
  });

  return (
    <article className="mb-2.5 rounded-10 bg-white p-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <div className="absolute left-10">
          <button className="mr-7 text-xs text-hyphen-purple">
            Active Position (2)
          </button>
          <button className="text-xs text-hyphen-gray-400">
            Show Closed Positions
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Your Positions</h2>

        <Link
          to="add-liquidity"
          className="absolute right-10 flex h-9 w-28 items-center justify-center rounded-xl bg-hyphen-purple text-xs text-white"
        >
          + Add Liquidity
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-2.5">
        {!isLoading ? (
          <>
            {userPositions?.map((userPositionId: BigNumber) => {
              return (
                <AssetOverview
                  key={userPositionId.toNumber()}
                  getPositionMetadata={getPositionMetadata}
                  getTokenAmount={getTokenAmount}
                  getTotalLiquidity={getTotalLiquidity}
                  positionId={userPositionId}
                  redirectToManageLiquidity
                />
              );
            })}
            {/* <AssetOverview
              apy={81.19}
              chainId={1}
              poolShare={0.02}
              redirectToManageLiquidity
              tokenSupplied={59.64}
              tokenSymbol="ETH"
              unclaimedFees={651}
            /> */}
          </>
        ) : (
          <>
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!h-37.5 !rounded-7.5"
              containerClassName="block leading-none"
            />
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!h-37.5 !rounded-7.5"
              containerClassName="block leading-none"
            />
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!h-37.5 !rounded-7.5"
              containerClassName="block leading-none"
            />
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!h-37.5 !rounded-7.5"
              containerClassName="block leading-none"
            />
          </>
        )}
      </section>
    </article>
  );
}

export default YourPositions;
