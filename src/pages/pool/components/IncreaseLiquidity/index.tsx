import ProgressBar from 'components/ProgressBar';
import { chains } from 'config/chains';
import tokens from 'config/tokens';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber } from 'ethers';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import useLPToken from 'hooks/useLPToken';
import useWhitelistPeriodManager from 'hooks/useWhitelistPeriodManager';
import { useEffect, useState } from 'react';
import { HiArrowSmLeft } from 'react-icons/hi';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import getTokenBalance from 'utils/getTokenBalance';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import AssetOverview from '../AssetOverview';
import LiquidityInfo from '../LiquidityInfo';
import StepSlider from '../StepSlider';

function IncreaseLiquidity() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();

  const { accounts } = useWalletProvider()!;

  const { getPositionMetadata } = useLPToken();
  const { getTotalLiquidity } = useLiquidityProviders();
  const { getTokenTotalCap } = useWhitelistPeriodManager();

  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityIncreaseAmount, setLiquidityIncreaseAmount] =
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

  const {
    shares,
    suppliedLiquidity,
    token: tokenAddress,
  } = positionMetadata || {};

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
      // Execute only when metadata is available.
      enabled: !!positionMetadata,
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

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    async function getWalletBalance() {
      if (!accounts || !chain || !token) return;

      const { displayBalance } = await getTokenBalance(
        accounts[0],
        chain,
        token,
      );
      setWalletBalance(displayBalance);
    }

    getWalletBalance();
  }, [accounts, chain, token]);

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? totalLiquidity / 10 ** tokenDecimals
      : totalLiquidity;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? tokenTotalCap / 10 ** tokenDecimals
      : tokenTotalCap;

  async function handleLiquidityAmountChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityIncreaseAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityIncreaseAmount);

    if (isInputValid) {
      setLiquidityIncreaseAmount(newLiquidityIncreaseAmount);
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setLiquidityIncreaseAmount('');
    } else if (walletBalance) {
      const newLiquidityRemovalAmount = (
        Math.trunc(Number.parseFloat(walletBalance) * (value / 100) * 1000) /
        1000
      ).toString();
      setLiquidityIncreaseAmount(newLiquidityRemovalAmount);
    }
  }

  function handleMaxButtonClick() {
    if (walletBalance) {
      setSliderValue(100);
      setLiquidityIncreaseAmount(
        (Math.trunc(Number.parseFloat(walletBalance) * 1000) / 1000).toString(),
      );
    }
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

        <h2 className="text-xl text-hyphen-purple">Increase Liquidity</h2>

        <div className="absolute right-0 flex">
          <button className="mr-4 text-xs text-hyphen-purple">Clear All</button>
        </div>
      </header>

      <AssetOverview positionId={BigNumber.from(positionId)} />

      <section className="mt-8 grid grid-cols-2">
        <div className="max-h-84 h-84 border-r pr-12.5 pt-9">
          <div className="mb-9">
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
            htmlFor="liquidityIncreaseAmount"
            className="flex justify-between px-5 text-xxs font-bold uppercase"
          >
            <span className="text-hyphen-gray-400">Input</span>
            <span className="flex items-center text-hyphen-gray-300">
              Balance: {walletBalance || '...'} {token?.symbol}
              <button
                className="ml-2 flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
                onClick={handleMaxButtonClick}
              >
                MAX
              </button>
            </span>
          </label>
          <input
            id="liquidityIncreaseAmount"
            placeholder="0.000"
            type="number"
            inputMode="decimal"
            className="mt-2 mb-6 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
            value={liquidityIncreaseAmount}
            onChange={handleLiquidityAmountChange}
          />

          <StepSlider
            dots
            onChange={handleSliderChange}
            step={25}
            value={sliderValue}
          />

          <button className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white">
            Confirm Supply
          </button>
        </div>
        <div className="max-h-84 flex h-84 flex-col justify-between pl-12.5 pt-3">
          <div className="grid grid-cols-2">
            <div className="flex flex-col">
              <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                Updated pool share
              </span>
              <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                0.07%
              </div>
            </div>
          </div>
          <LiquidityInfo />
        </div>
      </section>
    </article>
  );
}

export default IncreaseLiquidity;
