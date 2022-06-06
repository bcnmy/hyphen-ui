import { BigNumber } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import LiquidityPositionOverview from '../../LiquidityPositionOverview';
import { useWalletProvider } from 'context/WalletProvider';
import useLPToken from 'hooks/contracts/useLPToken';
import emptyPositionsIcon from '../../../../../assets/images/empty-positions-icon.svg';
import { useState } from 'react';
import { useChains } from 'context/Chains';
import { HiOutlineXCircle } from 'react-icons/hi';
import { useToken } from 'context/Token';

function LiquidityPositions() {
  const navigate = useNavigate();
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const { networks, selectedNetwork } = useChains()!;
  const { tokens } = useToken()!;

  const { getUserPositions } = useLPToken(selectedNetwork);
  const [hideClosedPositions, setHideClosedPositions] = useState(true);

  const {
    isError: userPositionsError,
    isLoading,
    data: userPositions,
  } = useQuery(
    ['userPositions', accounts],
    () => {
      if (!isLoggedIn || !accounts) return;

      return getUserPositions(accounts);
    },
    {
      enabled: !!(isLoggedIn && accounts && selectedNetwork),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );

  function handleAddLiquidity() {
    const isSelectedNetworkSupported = selectedNetwork
      ? networks?.find(
          networkObj => networkObj.chainId === selectedNetwork?.chainId,
        )
      : false;
    const network =
      isSelectedNetworkSupported && selectedNetwork
        ? selectedNetwork
        : networks?.[0];
    const tokenSymbol =
      tokens && network
        ? Object.keys(tokens).find(tokenSymbol => {
            const tokenObj = tokens[tokenSymbol];
            return tokenObj[network.chainId];
          })
        : undefined;
    const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;

    if (network && token) {
      navigate(`add-liquidity/${network.chainId}/${tokenSymbol}`);
    }
  }

  if (userPositionsError) {
    return (
      <article className="my-12.5 mb-2.5 rounded-10 bg-white p-2.5">
        <section className="my-16 flex items-center justify-center px-[1.875rem]">
          <HiOutlineXCircle className="mr-4 min-h-[24px] min-w-[24px] text-red-400" />
          <p className="text-hyphen-gray-400">
            Something went wrong while we were fetching your positions, please
            try again later.
          </p>
        </section>
      </article>
    );
  }

  return (
    <article className="mb-2.5 rounded-10 bg-white p-2.5">
      <header className="my-6 grid h-9 grid-cols-2 items-center px-[1.875rem] xl:grid-cols-3 xl:px-10">
        {isLoggedIn ? (
          <div className="hidden xl:flex">
            <button
              className={`mr-7 text-xs  ${
                hideClosedPositions
                  ? 'text-hyphen-purple'
                  : 'text-hyphen-gray-400'
              }`}
              onClick={() => setHideClosedPositions(true)}
            >
              Active Positions
            </button>
            <button
              className={`text-xs  ${
                !hideClosedPositions
                  ? 'text-hyphen-purple'
                  : 'text-hyphen-gray-400'
              }`}
              onClick={() => setHideClosedPositions(false)}
            >
              Show Closed Positions
            </button>
          </div>
        ) : null}

        <h2 className="justify-self-start text-sm text-hyphen-purple xl:justify-self-center xl:text-xl">
          Your Positions
        </h2>

        <button
          className="h-9 w-28 justify-self-end rounded-xl bg-hyphen-purple text-xs text-white"
          onClick={handleAddLiquidity}
        >
          + Add Liquidity
        </button>
      </header>

      {!isLoading ? (
        selectedNetwork && userPositions && userPositions.length > 0 ? (
          <section className="grid grid-cols-1 gap-2.5">
            {userPositions.map((userPositionId: BigNumber) => {
              return (
                <LiquidityPositionOverview
                  key={`${userPositionId.toString()}`}
                  chainId={selectedNetwork.chainId}
                  positionId={userPositionId}
                  hideClosedPositions={hideClosedPositions}
                />
              );
            })}
          </section>
        ) : (
          <section className="my-16 flex flex-col items-center justify-start px-[1.875rem]">
            <div className="flex items-center">
              <img
                src={emptyPositionsIcon}
                alt="No positions"
                className="mr-4"
              />
              <span className="text-hyphen-gray-400">
                Your Hyphen liquidity positions will appear here.
              </span>
            </div>
            {!isLoggedIn ? (
              <button
                className="mb-8 h-15 w-[400px] rounded-2.5 bg-hyphen-purple font-semibold text-white"
                onClick={connect}
              >
                Connect Your Wallet
              </button>
            ) : null}
          </section>
        )
      ) : (
        <section className="my-20 flex items-center justify-center px-[1.875rem]">
          <svg
            role="status"
            className="mr-4 h-6 w-6 animate-spin fill-hyphen-purple text-gray-200"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <p className="text-hyphen-gray-400">
            Getting your liquidity positions.
          </p>
        </section>
      )}
    </article>
  );
}

export default LiquidityPositions;
