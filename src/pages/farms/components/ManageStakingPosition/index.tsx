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

function ManageStakingPosition() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();

  return (
    <article className="my-24 rounded-10 bg-white p-12.5 pt-2.5">
      {/* <StakingPositionOverview
        // Need to pass props here.
      /> */}

      <section className="grid grid-cols-2">
        <div className="flex h-[612px] max-h-[612px] flex-col border-r pr-12.5 pt-2">
          <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
            Your Position NFT
          </span>

          {/* {userPositionNFT ? (
            <img src={userPositionNFT} alt="Position NFT" className="mt-2" />
          ) : (
            <Skeleton
              baseColor="#615ccd20"
              enableAnimation
              highlightColor="#615ccd05"
              className="!mt-2 !h-[411px] !w-[411px] !rounded-7.5"
              containerClassName="block leading-none"
            />
          )} */}

          <button className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300">
            Unstake NFT Position
          </button>
        </div>

        <div className="flex h-[612px] max-h-[612px] flex-col justify-between pl-12.5 pt-2">
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                Unclaimed Bico
              </span>
              <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                40.87
              </div>
            </div>

            <button className="mt-10 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300">
              Claim Reward
            </button>
          </div>
          <FarmsInfo />
        </div>
      </section>
    </article>
  );
}

export default ManageStakingPosition;
