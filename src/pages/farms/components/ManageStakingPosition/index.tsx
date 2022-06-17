import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber, ethers } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import { HiArrowSmLeft, HiOutlineEmojiSad, HiX } from 'react-icons/hi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import StakingPositionOverview from '../StakingPositionOverview';
import FarmsInfo from 'pages/farms/FarmsInfo';
import Skeleton from 'react-loading-skeleton';
import switchNetwork from 'utils/switchNetwork';
import { useNotifications } from 'context/Notifications';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import collectFeesIcon from '../../../../assets/images/collect-fees-icon.svg';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';
import { useEffect, useState } from 'react';
import { OPTIMISM_CHAIN_ID } from 'config/constants';

function ManageStakingPosition() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();
  const queryClient = useQueryClient();

  const { accounts, connect, currentChainId, isLoggedIn, walletProvider } =
    useWalletProvider()!;
  const { networks } = useChains()!;
  const { tokens } = useToken()!;
  const { addTxNotification } = useNotifications()!;

  const chain = chainId
    ? networks?.find(networkObj => {
        return networkObj.chainId === Number.parseInt(chainId);
      })!
    : undefined;

  const { getPositionMetadata, getTokenURI } = useLPToken(chain);
  const { claimFee, getPendingToken, getRewardTokenAddress, unstakeNFT } =
    useLiquidityFarming(chain);

  const [showError, setShowError] = useState<boolean>(false);

  const {
    data: positionMetadata,
    isError: positionMetadataError,
    isLoading: isPositionMetadataLoading,
  } = useQuery(
    ['positionMetadata', chain?.chainId, positionId],
    () => getPositionMetadata(BigNumber.from(positionId)),
    {
      // Execute only when positionid is available.
      enabled: !!positionId,
    },
  );

  const [tokenAddress] = positionMetadata || [];

  const {
    data: positionNFTData,
    isError: positionNFTDataError,
    isLoading: isPositionNFTDataLoading,
  } = useQuery(
    ['positionNFT', chain?.chainId, positionId],
    () => getTokenURI(BigNumber.from(positionId)),
    {
      // Execute only when positionid is available.
      enabled: !!positionId,
    },
  );

  const nftJsonManifestString = positionNFTData
    ? atob(positionNFTData.substring(29))
    : '';
  const { image: positionNFT = undefined } = nftJsonManifestString
    ? JSON.parse(nftJsonManifestString)
    : {};

  const {
    data: rewardTokenAddress,
    isError: rewardTokenAddressError,
    isLoading: rewardTokenAddressLoading,
  } = useQuery(
    ['rewardTokenAddress', chain?.chainId, tokenAddress],
    () => getRewardTokenAddress(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  // Get reward token address depending on whether
  // rewardTokenAddress is an array (V2 Liquidity Farming)
  // or just a string (V1 Liquidity Farming).
  const rewardTokenSymbol =
    rewardTokenAddress && tokens && chain
      ? Object.keys(tokens).find(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return tokenObj[chain.chainId]
            ? Array.isArray(rewardTokenAddress)
              ? tokenObj[chain.chainId].address.toLowerCase() ===
                rewardTokenAddress[0].toLowerCase()
              : tokenObj[chain.chainId].address.toLowerCase() ===
                rewardTokenAddress.toLowerCase()
            : false;
        })
      : undefined;
  const rewardToken =
    tokens && rewardTokenSymbol ? tokens[rewardTokenSymbol] : undefined;

  const rewardTokenDecimals =
    chain && rewardToken ? rewardToken[chain.chainId].decimal : null;

  const {
    data: pendingToken,
    isError: pendingTokenError,
    isLoading: pendingTokenLoading,
  } = useQuery(
    ['pendingToken', chain?.chainId, positionId],
    () => {
      // Call getPendingToken with reward token address
      // if chainId is in OPTIMISM_CHAIN_ID.
      if (Number.parseInt(chainId ?? '', 10) === OPTIMISM_CHAIN_ID) {
        return getPendingToken(
          BigNumber.from(positionId),
          rewardTokenAddress[0],
        );
      } else {
        return getPendingToken(BigNumber.from(positionId));
      }
    },
    {
      enabled: !!(positionId && rewardTokenAddress),
    },
  );

  const unclaimedRewardToken =
    pendingToken && rewardTokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(pendingToken, rewardTokenDecimals),
        )
      : 0;

  const {
    error: unstakeNFTError,
    isLoading: unstakeNFTLoading,
    mutate: unstakeNFTMutation,
  } = useMutation(
    async ({
      positionId,
      accounts,
    }: {
      positionId: BigNumber;
      accounts: string[];
    }) => {
      const unstakeNFTTx = await unstakeNFT(positionId, accounts);
      addTxNotification(
        unstakeNFTTx,
        'Unstake NFT',
        `${chain?.explorerUrl}/tx/${unstakeNFTTx.hash}`,
      );
      return await unstakeNFTTx.wait(1);
    },
  );

  const {
    error: claimFeeError,
    isLoading: claimFeeLoading,
    mutate: claimFeeMutation,
  } = useMutation(
    async ({
      positionId,
      accounts,
    }: {
      positionId: BigNumber;
      accounts: string[];
    }) => {
      let claimFeeTx;
      if (Number.parseInt(chainId ?? '', 10) === OPTIMISM_CHAIN_ID) {
        claimFeeTx = await claimFee(positionId, accounts, rewardTokenAddress);
      } else {
        claimFeeTx = await claimFee(positionId, accounts);
      }
      addTxNotification(
        claimFeeTx,
        'Claim fee',
        `${chain?.explorerUrl}/tx/${claimFeeTx.hash}`,
      );
      return await claimFeeTx.wait(1);
    },
  );

  const { code: unstakeNFTErrorCode } =
    (unstakeNFTError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};
  const { code: claimFeeErrorCode } =
    (claimFeeError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};

  // Check if there's an error in queries or mutations.
  const isError =
    positionMetadataError ||
    positionNFTDataError ||
    rewardTokenAddressError ||
    pendingTokenError ||
    unstakeNFTError ||
    claimFeeError;

  useEffect(() => {
    if (isError) {
      setShowError(true);
    }
  }, [isError]);

  const isDataLoading =
    isPositionMetadataLoading ||
    isPositionNFTDataLoading ||
    rewardTokenAddressLoading ||
    pendingTokenLoading ||
    unstakeNFTLoading ||
    claimFeeLoading;

  function handleNetworkChange() {
    if (!walletProvider || !chain) return;
    switchNetwork(walletProvider, chain);
  }

  function handleUnstakeNFTClick() {
    if (!accounts || !positionId) return;

    unstakeNFTMutation(
      {
        positionId: BigNumber.from(positionId),
        accounts: accounts,
      },
      {
        onSuccess: onUnstakeNFTSuccess,
      },
    );
  }

  function onUnstakeNFTSuccess() {
    queryClient.invalidateQueries();
    navigate('/farms');
  }

  function handleClaimFeeClick() {
    if (!accounts || !positionId || unclaimedRewardToken <= 0) return;

    claimFeeMutation(
      {
        positionId: BigNumber.from(positionId),
        accounts: accounts,
      },
      {
        onSuccess: onClaimFeeSuccess,
      },
    );
  }

  function onClaimFeeSuccess() {
    queryClient.invalidateQueries();
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
          Manage Staking Position
        </h2>
      </header>

      {chainId ? (
        <div className="px-2.5 xl:px-0">
          <StakingPositionOverview
            chainId={Number.parseInt(chainId)}
            positionId={BigNumber.from(positionId)}
          />
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 px-10 xl:grid-cols-2 xl:px-0">
        <div className="mb-12 flex flex-col pt-2 xl:mb-0 xl:h-[34.25rem] xl:max-h-[34.25rem] xl:border-r xl:pr-12.5">
          <span className="pl-5 text-xxxs font-bold uppercase text-hyphen-gray-400 xl:text-xxs">
            Your Position NFT
          </span>

          {positionNFT ? (
            <img src={positionNFT} alt="Position NFT" className="mt-2" />
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
                <button
                  className="mt-10 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                  disabled={isDataLoading}
                  onClick={handleUnstakeNFTClick}
                >
                  {unstakeNFTLoading
                    ? 'Unstaking NFT Position'
                    : 'Unstake NFT Position'}
                </button>
              ) : (
                <button
                  className="mt-10 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                  onClick={handleNetworkChange}
                >
                  Switch to {chain?.name}
                </button>
              )}
            </>
          ) : null}
          {!isLoggedIn ? (
            <button
              className="mt-10 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
              onClick={connect}
            >
              Connect Your Wallet
            </button>
          ) : null}
        </div>

        <div className="flex flex-col justify-between pt-2 xl:h-[34.25rem] xl:max-h-[34.25rem] xl:pl-12.5">
          <div className="grid grid-cols-1">
            <div className="flex flex-col">
              <span className="pl-5 text-xxxs font-bold uppercase text-hyphen-gray-400 xl:text-xxs">
                Unclaimed {rewardToken?.symbol}
              </span>
              <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-sm text-hyphen-gray-400 xl:text-2xl">
                {unclaimedRewardToken > 0 ? unclaimedRewardToken.toFixed(5) : 0}{' '}
                {rewardToken?.symbol}
              </div>

              {isLoggedIn ? (
                <>
                  {currentChainId === chain?.chainId ? (
                    <button
                      className="mt-10 mb-[3.125rem] flex h-15 w-full items-center justify-center rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300 xl:mb-0"
                      disabled={isDataLoading || unclaimedRewardToken <= 0}
                      onClick={handleClaimFeeClick}
                    >
                      {unclaimedRewardToken <= 0 ? (
                        'No reward to claim'
                      ) : claimFeeLoading ? (
                        'Claiming Reward'
                      ) : (
                        <>
                          <img
                            src={collectFeesIcon}
                            alt="Collect rewards"
                            className="mr-1"
                          />
                          Claim Reward
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="mt-10 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                      onClick={handleNetworkChange}
                    >
                      Switch to {chain?.name}
                    </button>
                  )}
                </>
              ) : null}
              {!isLoggedIn ? (
                <button
                  className="mt-10 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                  onClick={connect}
                >
                  Connect Your Wallet
                </button>
              ) : null}
            </div>
          </div>
          <FarmsInfo />
        </div>
      </section>

      {isError && showError ? (
        <article className="relative mt-6 flex  h-12 items-center justify-center rounded-xl bg-red-100 p-2 text-sm text-red-600">
          <div className="flex items-center">
            <HiOutlineEmojiSad className="mr-4 h-6 w-6 text-red-400" />
            <span className="text-hyphen-gray-400">
              {unstakeNFTError && unstakeNFTErrorCode !== 4001
                ? 'Something went wrong while unstaking this NFT, please try again later.'
                : unstakeNFTError && unstakeNFTErrorCode === 4001
                ? 'User rejected the transaction'
                : claimFeeError && claimFeeErrorCode !== 4001
                ? 'Something went wrong while claiming fees for this NFT, please try again later.'
                : claimFeeError && claimFeeErrorCode === 4001
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

export default ManageStakingPosition;
