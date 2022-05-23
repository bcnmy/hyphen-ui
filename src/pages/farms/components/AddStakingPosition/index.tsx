import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import {
  HiArrowSmLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineEmojiSad,
  HiOutlineSearch,
  HiX,
} from 'react-icons/hi';
import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import StakingPositionOverview from '../StakingPositionOverview';
import emptyPositionsIcon from '../../../../assets/images/empty-positions-icon.svg';
import { useEffect, useState } from 'react';
import FarmsInfo from 'pages/farms/FarmsInfo';
import Skeleton from 'react-loading-skeleton';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import { useNotifications } from 'context/Notifications';
import switchNetwork from 'utils/switchNetwork';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';

function AddStakingPosition() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { chainId, tokenSymbol } = useParams();

  const { accounts, connect, currentChainId, isLoggedIn, walletProvider } =
    useWalletProvider()!;
  const { networks } = useChains()!;
  const { tokens } = useToken()!;
  const { addTxNotification } = useNotifications()!;

  const chain = chainId
    ? networks?.find(network => {
        return network.chainId === Number.parseInt(chainId);
      })!
    : undefined;

  const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;

  const chainColor = chain && token ? token[chain.chainId].chainColor : '';

  const {
    getNFTApprovalAddress,
    getNFTApproval,
    getPositionMetadata,
    getTokenURI,
    getUserPositions,
  } = useLPToken(chain);
  const { getRewardTokenAddress, stakeNFT } = useLiquidityFarming(chain);

  const [currentPosition, setCurrentPosition] = useState<number>(0);
  const [showError, setShowError] = useState<boolean>(false);

  const {
    data: userPositions,
    isError: userPositionsError,
    isLoading: isUserPositionsLoading,
  } = useQuery(
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

  const { data: rewardTokenAddress, isError: rewardTokenAddressError } =
    useQuery(
      ['rewardTokenAddress', token],
      () => {
        if (!chain || !token) return;

        return getRewardTokenAddress(token[chain.chainId].address);
      },
      {
        // Execute only when address is available.
        enabled: !!(chain && token),
      },
    );

  const rewardTokenSymbol =
    rewardTokenAddress && chain && tokens
      ? Object.keys(tokens).find(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return tokenObj[chain.chainId]
            ? tokenObj[chain.chainId].address.toLowerCase() ===
                rewardTokenAddress.toLowerCase()
            : false;
        })
      : undefined;
  const rewardToken =
    tokens && rewardTokenSymbol ? tokens[rewardTokenSymbol] : undefined;

  const {
    error: approveNFTError,
    isLoading: approveNFTLoading,
    mutate: approveNFTMutation,
  } = useMutation(
    async ({
      address,
      positionId,
    }: {
      address: string;
      positionId: BigNumber;
    }) => {
      const approveNFTTx = await getNFTApproval(address, positionId);
      addTxNotification(
        approveNFTTx,
        'Approve NFT',
        `${chain?.explorerUrl}/tx/${approveNFTTx.hash}`,
      );
      return await approveNFTTx.wait(1);
    },
  );

  const {
    error: stakeNFTError,
    isLoading: stakeNFTLoading,
    mutate: stakeNFTMutation,
  } = useMutation(
    async ({
      positionId,
      accounts,
    }: {
      positionId: BigNumber;
      accounts: string[];
    }) => {
      const stakeNFTTx = await stakeNFT(positionId, accounts);
      addTxNotification(
        stakeNFTTx,
        'Stake NFT',
        `${chain?.explorerUrl}/tx/${stakeNFTTx.hash}`,
      );
      return await stakeNFTTx.wait(1);
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
            tokenAddress.toLowerCase() &&
            suppliedLiquidity.gt(BigNumber.from(0))
        : false;
    }) ?? [];

  const hasUserPositionsLoaded =
    userPositionsMetadata.length > 0
      ? userPositionsMetadata.every(positionMetadata => {
          return positionMetadata.status === 'success';
        })
      : false;

  const {
    data: NFTApprovalAddress,
    isError: NFTApprovalAddressError,
    isLoading: isNFTApprovalAddressLoading,
    refetch: refetchNFTApprovalAddress,
  } = useQuery(
    ['NFTApprovalAddress', currentPosition],
    () => {
      if (!filteredUserPositions) return;

      return getNFTApprovalAddress(filteredUserPositions[currentPosition]);
    },
    {
      enabled: !!hasUserPositionsLoaded,
    },
  );

  const userPositionsNFTs = useQueries(
    filteredUserPositions?.map((userPosition: BigNumber) => {
      return {
        queryKey: ['userPositionsNFTs', userPosition],
        queryFn: () => getTokenURI(userPosition),
      };
    }) ?? [],
  );

  const { data }: { data: any } = userPositionsNFTs[currentPosition] ?? {};
  const nftJsonManifestString = data ? atob(data.substring(29)) : '';
  const { image: userPositionNFT = undefined } = nftJsonManifestString
    ? JSON.parse(nftJsonManifestString)
    : {};

  const [firstPositionMetadata] = userPositionsMetadata;
  const [firstPositionNFT] = userPositionsNFTs;
  const { status: firstPositionMetadataStatus } = firstPositionMetadata || {};
  const { status: firstPositionNFTStatus } = firstPositionNFT || {};

  const { code: approveNFTErrorCode } =
    (approveNFTError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};
  const { code: stakeNFTErrorCode } =
    (stakeNFTError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};

  // Check if there's an error in queries or mutations.
  const isError =
    userPositionsError ||
    rewardTokenAddressError ||
    approveNFTError ||
    stakeNFTError ||
    NFTApprovalAddressError;

  useEffect(() => {
    if (isError) {
      setShowError(true);
    }
  }, [isError]);

  const isDataLoading =
    isUserPositionsLoading ||
    isNFTApprovalAddressLoading ||
    approveNFTLoading ||
    stakeNFTLoading ||
    firstPositionMetadataStatus === 'loading' ||
    firstPositionNFTStatus === 'loading';

  const isNFTApproved =
    NFTApprovalAddress && chain
      ? NFTApprovalAddress.toLowerCase() ===
        chain.contracts.hyphen.liquidityFarming.toLowerCase()
      : false;

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

  function handleNetworkChange() {
    if (!walletProvider || !chain) return;
    switchNetwork(walletProvider, chain);
  }

  function handleApproveNFTClick() {
    if (!chain || currentPosition < 0 || !filteredUserPositions) return;

    approveNFTMutation(
      {
        address: chain.contracts.hyphen.liquidityFarming,
        positionId: filteredUserPositions[currentPosition],
      },
      {
        onSuccess: onApproveNFTSuccess,
      },
    );
  }

  function onApproveNFTSuccess() {
    queryClient.removeQueries('NFTApprovalAddress');
    refetchNFTApprovalAddress();
  }

  function handleStakeNFTClick() {
    if (!accounts || currentPosition < 0 || !filteredUserPositions) return;

    stakeNFTMutation(
      {
        positionId: filteredUserPositions[currentPosition],
        accounts: accounts,
      },
      {
        onSuccess: onStakeNFTSuccess,
      },
    );
  }

  function onStakeNFTSuccess() {
    queryClient.invalidateQueries();
    navigate('/farms');
  }

  return (
    <article className="my-12.5 rounded-10 bg-white p-0 py-2 xl:p-12.5 xl:pt-2.5">
      <header className="mt-6 mb-8 grid grid-cols-[2.5rem_1fr] items-center border-b px-10 pb-6 xl:mb-12 xl:grid-cols-3 xl:p-0 xl:pb-6">
        <div>
          <button
            className="flex items-center rounded text-hyphen-gray-400"
            onClick={() => navigate('/farms')}
          >
            <HiArrowSmLeft className="h-5 w-auto" />
          </button>
        </div>

        <h2 className="text-sm text-hyphen-purple xl:justify-self-center xl:text-xl">
          Add Staking Position
        </h2>
      </header>

      {!isLoggedIn ? (
        <section className="flex h-auto flex-col items-center justify-start">
          <div className="mt-12 mb-16 flex items-center">
            <img src={emptyPositionsIcon} alt="No positions" className="mr-4" />
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
      ) : null}

      {isLoggedIn ? (
        !isUserPositionsLoading && firstPositionMetadataStatus !== 'loading' ? (
          chain &&
          token &&
          filteredUserPositions.length > 0 &&
          firstPositionMetadataStatus === 'success' ? (
            <>
              <section className="grid grid-cols-1 px-2.5 xl:px-0">
                <div className="relative mb-8">
                  <button
                    className="absolute top-[60px] left-[-10px] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-hyphen-gray-100 xl:left-[-15px] xl:h-7.5 xl:w-7.5"
                    onClick={handlePrevPositionClick}
                  >
                    <HiOutlineChevronLeft />
                  </button>
                  {filteredUserPositions.map(
                    (userPosition: BigNumber, index: number) => {
                      return index === currentPosition ? (
                        <StakingPositionOverview
                          key={`${userPosition.toString()}`}
                          chainId={chain.chainId}
                          positionId={userPosition}
                        />
                      ) : null;
                    },
                  )}
                  <button
                    className="absolute top-[60px] right-[-10px] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-hyphen-gray-100 xl:right-[-15px] xl:h-7.5 xl:w-7.5"
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
                          className={`mx-1 h-2 rounded-full xl:h-2.5 ${
                            currentPosition === index
                              ? 'w-12 xl:w-14'
                              : 'w-2 bg-hyphen-gray-100 xl:w-2.5'
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

              <section className="grid grid-cols-1 px-10 xl:grid-cols-2 xl:px-0">
                <div className="mb-12 flex flex-col pt-2 xl:mb-0 xl:h-[38.25rem] xl:max-h-[38.25rem] xl:border-r xl:pr-12.5">
                  <span className="pl-5 text-xxxs font-bold uppercase text-hyphen-gray-400 xl:text-xxs">
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
                      className="!xl:w-[411px] !mt-2 aspect-square !w-full !rounded-7.5"
                      containerClassName="block leading-none"
                    />
                  )}

                  {isLoggedIn ? (
                    <>
                      {currentChainId === chain?.chainId ? (
                        <>
                          <button
                            className="mt-10 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                            disabled={isDataLoading || isNFTApproved}
                            onClick={handleApproveNFTClick}
                          >
                            {isNFTApproved
                              ? 'NFT Approved'
                              : approveNFTLoading
                              ? 'Approving NFT'
                              : 'Approve NFT'}
                          </button>
                          <button
                            className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                            disabled={isDataLoading || !isNFTApproved}
                            onClick={handleStakeNFTClick}
                          >
                            {stakeNFTLoading
                              ? 'Staking NFT Position'
                              : 'Stake NFT Position'}
                          </button>
                        </>
                      ) : (
                        <button
                          className="mt-28 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                          onClick={handleNetworkChange}
                        >
                          Switch to {chain?.name}
                        </button>
                      )}
                    </>
                  ) : null}
                  {!isLoggedIn ? (
                    <button
                      className="mt-28 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                      onClick={connect}
                    >
                      Connect Your Wallet
                    </button>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between pt-2 xl:h-[38.25rem] xl:max-h-[38.25rem] xl:pl-12.5">
                  <div className="grid grid-cols-1">
                    <div className="flex flex-col">
                      <span className="pl-5 text-xxxs font-bold uppercase text-hyphen-gray-400 xl:text-xxs">
                        Unclaimed {rewardToken?.symbol}
                      </span>

                      <div className="mt-2 mb-[3.125rem] flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-sm text-hyphen-gray-400 xl:mb-0 xl:text-2xl">
                        0 {rewardToken?.symbol}
                      </div>
                    </div>
                  </div>
                  <FarmsInfo />
                </div>
              </section>
            </>
          ) : !isUserPositionsLoading &&
            filteredUserPositions &&
            filteredUserPositions.length === 0 ? (
            <section className="mt-20 mb-12 flex h-auto items-start justify-center px-[1.875rem]">
              <div className="flex items-center justify-center">
                <HiOutlineSearch className="mr-4 min-h-[1.5rem] min-w-[1.5rem] text-hyphen-gray-200" />
                <span className="text-hyphen-gray-400">
                  You have no liquidity positions for this farm.
                </span>
              </div>
            </section>
          ) : null
        ) : (
          <section className="mt-20 mb-12 flex items-center justify-center px-[1.875rem]">
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
              Getting your Hyphen liquidity positions.
            </p>
          </section>
        )
      ) : null}

      {isError && showError ? (
        <article className="relative mt-6 flex  h-12 items-center justify-center rounded-xl bg-red-100 p-2 text-sm text-red-600">
          <div className="flex items-center">
            <HiOutlineEmojiSad className="mr-4 h-6 w-6 text-red-400" />
            <span className="text-hyphen-gray-400">
              {approveNFTError && approveNFTErrorCode !== 4001
                ? 'Something went wrong while approving this NFT, please try again later.'
                : approveNFTError && approveNFTErrorCode === 4001
                ? 'User rejected the transaction'
                : stakeNFTError && stakeNFTErrorCode !== 4001
                ? 'Something went wrong while staking this NFT, please try again later.'
                : stakeNFTError && stakeNFTErrorCode === 4001
                ? 'User rejected the transaction'
                : 'We could not get the necessary information, please try again later.'}
            </span>
          </div>
          <button
            className="absolute right-4"
            onClick={() => setShowError(false)}
          >
            <HiX className="h-5 w-5 text-red-400" />
          </button>
        </article>
      ) : null}
    </article>
  );
}

export default AddStakingPosition;
