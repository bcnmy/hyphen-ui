import ProgressBar from 'components/ProgressBar';
import { HiArrowSmLeft } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import AssetOverview from '../AssetOverview';
import StepSlider from '../StepSlider';
import collectFeesIcon from '../../../../assets/images/collect-fees-icon.svg';
import LiquidityInfo from '../LiquidityInfo';
import { BigNumber, ethers } from 'ethers';
import { useMutation, useQuery } from 'react-query';
import useLPToken from 'hooks/useLPToken';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import tokens from 'config/tokens';
import useWhitelistPeriodManager from 'hooks/useWhitelistPeriodManager';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { chains } from 'config/chains';
import { useState } from 'react';
import { useChains } from 'context/Chains';
import { useNotifications } from 'context/Notifications';

function ManagePosition() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();
  const { fromChain } = useChains()!;
  const { addTxNotification } = useNotifications()!;
  const { getPositionMetadata } = useLPToken();
  const { claimFee, getTokenAmount, getTotalLiquidity, removeLiquidity } =
    useLiquidityProviders();
  const { getTokenTotalCap } = useWhitelistPeriodManager();
  const [liquidityRemovalAmount, setLiquidityRemovalAmount] =
    useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const { isLoading: isPositionMetadataLoading, data: positionMetadata } =
    useQuery(
      ['positionMetadata', positionId],
      () => getPositionMetadata(BigNumber.from(positionId)),
      {
        enabled: !!positionId,
      },
    );

  const [tokenAddress, suppliedLiquidity, shares] = positionMetadata || [];

  const chain = chainId
    ? chains.find(chainObj => {
        return chainObj.chainId === Number.parseInt(chainId);
      })
    : null;

  const token =
    chainId && tokenAddress
      ? tokens.find(tokenObj => {
          return (
            tokenObj[Number.parseInt(chainId)].address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : null;

  const tokenDecimals =
    chainId && token ? token[Number.parseInt(chainId)].decimal : null;

  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const { data: tokenAmount } = useQuery(
    ['tokenAmount', { shares, tokenAddress }],
    () => getTokenAmount(shares, tokenAddress),
    {
      // Execute only when shares & tokenAddress is available.
      enabled: !!(shares && tokenAddress),
    },
  );

  const { data: tokenTotalCap } = useQuery(
    ['tokenTotalCap', tokenAddress],
    () => getTokenTotalCap(tokenAddress),
    {
      // Execute only when accounts are available.
      enabled: !!tokenAddress,
    },
  );

  const {
    isLoading: removeLiquidityLoading,
    isSuccess: removeLiquiditySuccess,
    mutate: removeLiquidityMutation,
  } = useMutation(
    async ({
      positionId,
      amount,
    }: {
      positionId: BigNumber;
      amount: BigNumber;
    }) => {
      const removeLiquidityTx = await removeLiquidity(positionId, amount);
      addTxNotification(
        removeLiquidityTx,
        'Remove liquidity',
        `${fromChain?.explorerUrl}/tx/${removeLiquidityTx.hash}`,
      );
      return await removeLiquidityTx.wait(1);
    },
  );

  const {
    isLoading: claimFeeLoading,
    isSuccess: claimFeeSuccess,
    mutate: claimFeeMutation,
  } = useMutation(async ({ positionId }: { positionId: BigNumber }) => {
    const claimFeeTx = await claimFee(positionId);
    addTxNotification(
      claimFeeTx,
      'Claim fee',
      `${fromChain?.explorerUrl}/tx/${claimFeeTx.hash}`,
    );
    return await claimFeeTx.wait(1);
  });

  const formattedSuppliedLiquidity =
    suppliedLiquidity && tokenDecimals
      ? suppliedLiquidity / 10 ** tokenDecimals
      : null;

  const formattedTokenAmount =
    tokenAmount && tokenDecimals ? tokenAmount / 10 ** tokenDecimals : null;

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? totalLiquidity / 10 ** tokenDecimals
      : totalLiquidity;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? tokenTotalCap / 10 ** tokenDecimals
      : tokenTotalCap;

  const unclaimedFees =
    formattedSuppliedLiquidity && formattedTokenAmount
      ? formattedSuppliedLiquidity - formattedTokenAmount
      : 0;

  function handleIncreaseLiquidity() {
    navigate(`../increase-liquidity/${chainId}/${positionId}`);
  }

  async function handleLiquidityAmountChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityRemovalAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityRemovalAmount);

    if (isInputValid) {
      setLiquidityRemovalAmount(newLiquidityRemovalAmount);
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setLiquidityRemovalAmount('');
    } else if (formattedSuppliedLiquidity) {
      const newLiquidityRemovalAmount = (
        Math.trunc(formattedSuppliedLiquidity * (value / 100) * 1000) / 1000
      ).toString();
      setLiquidityRemovalAmount(newLiquidityRemovalAmount);
    }
  }

  function handleMaxButtonClick() {
    if (formattedSuppliedLiquidity) {
      setSliderValue(100);
      setLiquidityRemovalAmount(
        (Math.trunc(formattedSuppliedLiquidity * 1000) / 1000).toString(),
      );
    }
  }

  function handleConfirmRemovalClick() {
    if (liquidityRemovalAmount && tokenDecimals) {
      removeLiquidityMutation(
        {
          positionId: BigNumber.from(positionId),
          amount: ethers.utils.parseUnits(
            liquidityRemovalAmount,
            tokenDecimals,
          ),
        },
        {
          onSuccess: onRemoveLiquiditySuccess,
        },
      );
    }
  }

  function handleClaimFeeClick() {
    if (unclaimedFees) {
      claimFeeMutation(
        {
          positionId: BigNumber.from(positionId),
        },
        {
          onSuccess: onRemoveLiquiditySuccess,
        },
      );
    }
  }

  function onRemoveLiquiditySuccess() {
    navigate('/pool');
  }

  if (isPositionMetadataLoading) return null;

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

        <h2 className="text-xl text-hyphen-purple">Manage Position</h2>

        <div className="absolute right-0 flex">
          <button className="mr-4 text-xs text-hyphen-purple">Clear All</button>
        </div>
      </header>

      <AssetOverview positionId={BigNumber.from(positionId)} />

      <section className="mt-8 grid grid-cols-2">
        <div className="max-h-100 h-100 border-r pr-12.5 pt-9">
          <div className="mb-8">
            <ProgressBar
              currentProgress={formattedTotalLiquidity}
              totalProgress={formattedTokenTotalCap}
            />
            <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
              <span>Pool cap</span>
              <span>
                {makeNumberCompact(formattedTotalLiquidity) || '...'}{' '}
                {token?.symbol} /{' '}
                {makeNumberCompact(formattedTokenTotalCap) || '...'}{' '}
                {token?.symbol}
              </span>
            </div>
          </div>

          <label
            htmlFor="liquidityRemovalAmount"
            className="flex justify-between px-5 text-xxs font-bold uppercase"
          >
            <span className="text-hyphen-gray-400">Input</span>
            <span className="flex items-center text-hyphen-gray-300">
              Balance: {formattedSuppliedLiquidity || '...'} {token?.symbol}
              <button
                className="ml-2 flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
                onClick={handleMaxButtonClick}
              >
                MAX
              </button>
            </span>
          </label>
          <input
            id="liquidityRemovalAmount"
            placeholder="0.000"
            type="number"
            inputMode="decimal"
            className="mt-2 mb-6 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
            value={liquidityRemovalAmount}
            onChange={handleLiquidityAmountChange}
          />

          <StepSlider
            dots
            onChange={handleSliderChange}
            step={25}
            value={sliderValue}
          />

          <button
            className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
            onClick={handleConfirmRemovalClick}
          >
            Confirm Removal
          </button>
          <button
            className="h-15 w-full rounded-2.5 border-2 border-hyphen-purple font-semibold text-hyphen-purple"
            onClick={handleIncreaseLiquidity}
          >
            + Increase Liquidity
          </button>
        </div>
        <div className="max-h-100 h-100 pl-12.5 pt-1">
          <label
            htmlFor="unclaimedFees"
            className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400"
          >
            Unclaimed Fees
          </label>
          <div className="mt-2 mb-10 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
            {unclaimedFees}
          </div>

          <button
            className="mb-11 flex h-15 w-full items-center justify-center rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
            disabled={unclaimedFees === 0}
            onClick={handleClaimFeeClick}
          >
            {unclaimedFees === 0 ? (
              'No fees to collect'
            ) : (
              <>
                <img
                  src={collectFeesIcon}
                  alt="Collect fees"
                  className="mr-1"
                />
                `Collect Fees`
              </>
            )}
          </button>

          <LiquidityInfo />
        </div>
      </section>
    </article>
  );
}

export default ManagePosition;
