import { chains } from 'config/chains';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import {
  HiArrowSmLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { useQueries, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import StakingPositionOverview from '../StakingPositionOverview';
import emptyPositionsIcon from '../../../../assets/images/empty-positions-icon.svg';
import { useState } from 'react';
import tokens from 'config/tokens';
import FarmsInfo from 'pages/farms/FarmsInfo';
import Skeleton from 'react-loading-skeleton';

function AddStakingPosition() {
  const navigate = useNavigate();
  const { chainId, tokenSymbol } = useParams();

  const { accounts, connect, isLoggedIn } = useWalletProvider()!;

  const chain = chainId
    ? chains.find(chainObj => {
        return chainObj.chainId === Number.parseInt(chainId);
      })!
    : undefined;

  const token = tokenSymbol
    ? tokens.find(tokenObj => {
        return tokenObj.symbol === tokenSymbol;
      })
    : undefined;

  const chainColor = chain && token ? token[chain.chainId].chainColor : '';

  const { getPositionMetadata, getTokenURI, getUserPositions } =
    useLPToken(chain);

  const [currentPosition, setCurrentPosition] = useState<number>(0);

  const { isLoading, data: userPositions } = useQuery(
    ['userPositions', accounts],
    () => {
      if (!isLoggedIn || !accounts) return;

      return getUserPositions(accounts);
    },
    {
      enabled: !!(isLoggedIn && accounts),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  );

  const userPositionsMetadata = useQueries(
    userPositions?.map((userPosition: BigNumber) => {
      return {
        queryKey: ['userPositionsMetadata', userPosition],
        queryFn: () => getPositionMetadata(userPosition),
      };
    }) ?? [],
  );

  const filteredUserPositions =
    userPositions?.filter((userPosition: BigNumber, index: number) => {
      const { data: positionMetadata } =
        (userPositionsMetadata[index] as any) ?? [];
      const [tokenAddress, suppliedLiquidity] = positionMetadata ?? [];

      return chain && token && tokenAddress
        ? token[chain.chainId].address.toLowerCase() ===
            tokenAddress.toLowerCase() && suppliedLiquidity.gt(0)
        : false;
    }) ?? [];

  const userPositionsNFTs = useQueries(
    filteredUserPositions?.map((userPosition: BigNumber) => {
      return {
        queryKey: ['userPositionsNFTs', userPosition],
        queryFn: () => getTokenURI(userPosition),
      };
    }) ?? [],
  );

  const { data }: { data: any } = userPositionsNFTs[currentPosition] ?? {};
  const jsonManifestString = data ? atob(data.substring(29)) : '';
  const { image: userPositionNFT = undefined } = jsonManifestString
    ? JSON.parse(jsonManifestString)
    : {};

  const [firstPositionMetadata] = userPositionsMetadata;
  const { status: firstPositionStatus } = firstPositionMetadata || {};

  function handlePrevPositionClick() {
    const newPosition =
      currentPosition - 1 < 0
        ? filteredUserPositions.length - 1
        : currentPosition - 1;
    setCurrentPosition(newPosition);
  }

  function handleNextPositionClick() {
    const newPosition =
      currentPosition + 1 >= filteredUserPositions.length
        ? 0
        : currentPosition + 1;
    setCurrentPosition(newPosition);
  }

  return (
    <>
      {/* {selectedChain && selectedToken && liquidityAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={selectedChain.name}
          selectedTokenName={selectedToken.name}
          transferAmount={parseFloat(liquidityAmount)}
        />
      ) : null} */}
      <article className="my-24 rounded-10 bg-white p-12.5 pt-2.5">
        <header className="relative mt-6 mb-12 flex items-center justify-center border-b px-10 pb-6">
          <div className="absolute left-0">
            <button
              className="flex items-center rounded text-hyphen-gray-400"
              onClick={() => navigate(-1)}
            >
              <HiArrowSmLeft className="h-5 w-auto" />
            </button>
          </div>

          <h2 className="text-xl text-hyphen-purple">Add Staking Position</h2>
        </header>

        {!isLoading && firstPositionStatus !== 'loading' ? (
          chain &&
          token &&
          filteredUserPositions &&
          firstPositionStatus === 'success' ? (
            <>
              <section className="grid grid-cols-1">
                <div className="relative mb-8">
                  <button
                    className="absolute top-[60px] left-[-15px] flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-hyphen-gray-100"
                    onClick={handlePrevPositionClick}
                  >
                    <HiOutlineChevronLeft />
                  </button>
                  {filteredUserPositions.map(
                    (userPosition: BigNumber, index: number) => {
                      return index === currentPosition ? (
                        <StakingPositionOverview
                          key={`${chainId}-${userPosition.toString()}`}
                          chainId={chain.chainId}
                          positionId={userPosition}
                        />
                      ) : null;
                    },
                  )}
                  <button
                    className="absolute top-[60px] right-[-15px] flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-hyphen-gray-100"
                    onClick={handleNextPositionClick}
                  >
                    <HiOutlineChevronRight />
                  </button>
                </div>
                <div className="mb-8 flex justify-center">
                  {filteredUserPositions.map(
                    (userPosition: BigNumber, index: number) => {
                      return (
                        <button
                          key={`${chainId}-${userPosition.toString()}`}
                          className={`mx-1 h-2.5 rounded-full ${
                            currentPosition === index
                              ? 'w-14'
                              : 'w-2.5 bg-hyphen-gray-100'
                          }`}
                          onClick={() => setCurrentPosition(index)}
                          style={{
                            backgroundColor:
                              currentPosition === index ? chainColor : '',
                          }}
                        ></button>
                      );
                    },
                  )}
                </div>
              </section>

              <section className="grid grid-cols-2">
                <div className="flex h-[612px] max-h-[612px] flex-col border-r pr-12.5 pt-2">
                  <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                    Your Position NFT
                  </span>

                  {userPositionNFT ? (
                    <img
                      src={userPositionNFT}
                      alt="Position NFT"
                      className="mt-2"
                    />
                  ) : (
                    <Skeleton
                      baseColor="#615ccd20"
                      enableAnimation
                      highlightColor="#615ccd05"
                      className="!mt-2 !h-[411px] !w-[411px] !rounded-7.5"
                      containerClassName="block leading-none"
                    />
                  )}

                  <button className="mt-10 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300">
                    Approve NFT
                  </button>
                  <button className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300">
                    Stake NFT Position
                  </button>
                </div>

                <div className="flex h-[612px] max-h-[612px] flex-col justify-between pl-12.5 pt-2">
                  <div className="grid grid-cols-2">
                    <div className="flex flex-col">
                      <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                        Unclaimed Bico
                      </span>
                      <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                        0
                      </div>
                    </div>
                  </div>
                  <FarmsInfo />
                </div>
              </section>
            </>
          ) : (
            <section className="flex h-auto flex-col items-center justify-start">
              <div className="mt-12 mb-16 flex items-center">
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
          <section className="flex h-auto items-start justify-center">
            <div className="mt-12 mb-16 flex">
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
              <span className="text-hyphen-gray-400">
                Getting your Hyphen liquidity positions.
              </span>
            </div>
          </section>
        )}
      </article>
    </>
  );
}

export default AddStakingPosition;
