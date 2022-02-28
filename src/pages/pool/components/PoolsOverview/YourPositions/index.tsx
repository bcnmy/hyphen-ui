import { BigNumber } from 'ethers';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import Skeleton from 'react-loading-skeleton';
import AssetOverview from '../../AssetOverview';
import { useWalletProvider } from 'context/WalletProvider';
import useLPToken from 'hooks/useLPToken';

function YourPositions() {
  const { accounts } = useWalletProvider()!;
  const { getUserPositions } = useLPToken();

  const {
    isLoading,
    isError,
    data: userPositions,
  } = useQuery(['userPositions', accounts], () => getUserPositions(accounts), {
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
                  positionId={userPositionId}
                  redirectToManageLiquidity
                />
              );
            })}
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
