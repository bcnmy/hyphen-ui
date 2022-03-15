import { chains } from 'config/chains';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber, ethers } from 'ethers';
import useLPToken from 'hooks/contracts/useLPToken';
import {
  HiArrowSmLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import StakingPositionOverview from '../StakingPositionOverview';
import emptyPositionsIcon from '../../../../assets/images/empty-positions-icon.svg';
import { useState } from 'react';
import tokens from 'config/tokens';
import FarmsInfo from 'pages/farms/FarmsInfo';
import Skeleton from 'react-loading-skeleton';
import switchNetwork from 'utils/switchNetwork';
import { useNotifications } from 'context/Notifications';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import collectFeesIcon from '../../../../assets/images/collect-fees-icon.svg';

function ManageStakingPosition() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();
  const queryClient = useQueryClient();

  const { accounts, connect, currentChainId, isLoggedIn, walletProvider } =
    useWalletProvider()!;
  const { addTxNotification } = useNotifications()!;

  const chain = chainId
    ? chains.find(chainObj => {
        return chainObj.chainId === Number.parseInt(chainId);
      })!
    : undefined;

  const { getPositionMetadata, getTokenURI } = useLPToken(chain);
  const { claimFee, getPendingToken, getRewardTokenAddress, unstakeNFT } =
    useLiquidityFarming(chain);

  const { isLoading: isPositionMetadataLoading, data: positionMetadata } =
    useQuery(
      ['positionMetadata', positionId],
      () => getPositionMetadata(BigNumber.from(positionId)),
      {
        // Execute only when positionid is available.
        enabled: !!positionId,
      },
    );

  const [tokenAddress] = positionMetadata || [];

  const token =
    chainId && tokenAddress
      ? tokens.find(tokenObj => {
          return (
            tokenObj[Number.parseInt(chainId)]?.address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : null;

  const tokenDecimals =
    chainId && token ? token[Number.parseInt(chainId)].decimal : null;

  const { isLoading: isPositionNFTDataLoading, data: positionNFTData } =
    useQuery(
      ['positionNFT', positionId],
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

  const { isLoading: rewardTokenAddressLoading, data: rewardTokenAddress } =
    useQuery(
      'rewardTokenAddress',
      () => {
        if (!chain || !token) return;

        return getRewardTokenAddress(token[chain.chainId].address);
      },
      {
        // Execute only when address is available.
        enabled: !!(chain && token),
      },
    );

  const rewardToken =
    rewardTokenAddress && chain
      ? tokens.find(tokenObj => {
          return tokenObj[chain.chainId]
            ? tokenObj[chain.chainId].address.toLowerCase() ===
                rewardTokenAddress.toLowerCase()
            : false;
        })
      : undefined;

  const rewardTokenDecimals =
    chain && rewardToken ? rewardToken[chain.chainId].decimal : null;

  const { isLoading: pendingTokenLoading, data: pendingToken } = useQuery(
    ['pendingToken', positionId],
    () => getPendingToken(BigNumber.from(positionId)),
  );

  const unclaimedRewardToken =
    pendingToken && rewardTokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(pendingToken, rewardTokenDecimals),
        )
      : 0;

  const { isLoading: unstakeNFTLoading, mutate: unstakeNFTMutation } =
    useMutation(
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

  const { isLoading: claimFeeLoading, mutate: claimFeeMutation } = useMutation(
    async ({
      positionId,
      accounts,
    }: {
      positionId: BigNumber;
      accounts: string[];
    }) => {
      const claimFeeTx = await claimFee(positionId, accounts);
      addTxNotification(
        claimFeeTx,
        'Claim fee',
        `${chain?.explorerUrl}/tx/${claimFeeTx.hash}`,
      );
      return await claimFeeTx.wait(1);
    },
  );

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

        <h2 className="text-xl text-hyphen-purple">Manage Staking Position</h2>
      </header>

      {chainId ? (
        <StakingPositionOverview
          chainId={Number.parseInt(chainId)}
          positionId={BigNumber.from(positionId)}
        />
      ) : null}

      <section className="mt-8 grid grid-cols-2">
        <div className="flex h-[548px] max-h-[548px] flex-col border-r pr-12.5 pt-2">
          <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
            Your Position NFT
          </span>

          {positionNFT ? (
            <img src={positionNFT} alt="Position NFT" className="mt-2" />
          ) : (
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!mt-2 !h-[411px] !w-[411px] !rounded-7.5"
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

        <div className="flex h-[548px] max-h-[548px] flex-col justify-between pl-12.5 pt-2">
          <div className="grid grid-cols-1">
            <div className="flex flex-col">
              <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                Unclaimed {rewardToken?.symbol}
              </span>
              <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                {unclaimedRewardToken > 0 ? unclaimedRewardToken.toFixed(5) : 0}{' '}
                {rewardToken?.symbol}
              </div>

              {isLoggedIn ? (
                <>
                  {currentChainId === chain?.chainId ? (
                    <button
                      className="mt-10 flex h-15 w-full items-center justify-center rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                      disabled={isDataLoading}
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
          </div>
          <FarmsInfo />
        </div>
      </section>
    </article>
  );
}

export default ManageStakingPosition;
