import ProgressBar from 'components/ProgressBar';
import { NATIVE_ADDRESS } from 'config/constants';
import { useNotifications } from 'context/Notifications';
import { useWalletProvider } from 'context/WalletProvider';
import { BigNumber, ethers } from 'ethers';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import useLPToken from 'hooks/contracts/useLPToken';
import useWhitelistPeriodManager from 'hooks/contracts/useWhitelistPeriodManager';
import { useEffect, useState } from 'react';
import { HiArrowSmLeft, HiOutlineEmojiSad, HiX } from 'react-icons/hi';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import getTokenBalance from 'utils/getTokenBalance';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import LiquidityPositionOverview from '../LiquidityPositionOverview';
import LiquidityInfo from '../LiquidityInfo';
import StepSlider from '../StepSlider';
import Skeleton from 'react-loading-skeleton';
import switchNetwork from 'utils/switchNetwork';
import getTokenAllowance from 'utils/getTokenAllowance';
import giveTokenAllowance from 'utils/giveTokenAllowance';
import ApprovalModal from 'pages/bridge/components/ApprovalModal';
import useModal from 'hooks/useModal';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';

function IncreaseLiquidity() {
  const navigate = useNavigate();
  const { chainId, positionId } = useParams();
  const queryClient = useQueryClient();

  const {
    accounts,
    connect,
    loading,
    smartAccountAddress,
    currentChainId,
    isLoggedIn,
    signer,
    walletProvider,
  } = useWalletProvider()!;

  const { networks } = useChains()!;
  const { tokens } = useToken()!;
  const { addTxNotification } = useNotifications()!;

  const chain = chainId
    ? networks?.find(networkObj => {
        return networkObj.chainId === Number.parseInt(chainId);
      })!
    : undefined;

  const liquidityProvidersAddress = chain
    ? chain.contracts.hyphen.liquidityProviders
    : undefined;
  const { getPositionMetadata } = useLPToken(chain);
  const { getTotalLiquidity, increaseLiquidity, increaseNativeLiquidity } =
    useLiquidityProviders(chain);
  const { getTokenTotalCap, getTotalLiquidityByLp } =
    useWhitelistPeriodManager(chain);

  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityIncreaseAmount, setLiquidityIncreaseAmount] =
    useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [poolShare, setPoolShare] = useState<number>(0);
  const [showError, setShowError] = useState<boolean>(false);

  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();

  const { data: positionMetadata, isError: positionMetadataError } = useQuery(
    ['positionMetadata', chain?.chainId, positionId],
    () => getPositionMetadata(BigNumber.from(positionId)),
    {
      // Execute only when positionId is available.
      enabled: !!positionId,
    },
  );

  const [tokenAddress, suppliedLiquidity] = positionMetadata || [];

  const tokenSymbol =
    chainId && tokens && tokenAddress
      ? Object.keys(tokens).find(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return (
            tokenObj[Number.parseInt(chainId)]?.address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : undefined;
  const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;

  const tokenDecimals =
    chainId && token ? token[Number.parseInt(chainId)].decimal : null;

  const { data: totalLiquidity, isError: totalLiquidityError } = useQuery(
    ['totalLiquidity', chain?.chainId, tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const { data: tokenTotalCap, isError: tokenTotalCapError } = useQuery(
    ['tokenTotalCap', chain?.chainId, tokenAddress],
    () => getTokenTotalCap(tokenAddress),
    {
      // Execute only when tokenAddress is available.
      enabled: !!tokenAddress,
    },
  );

  const { isError: totalLiquidityByLPError } = useQuery(
    ['totalLiquidityByLP', chain?.chainId, tokenAddress],
    () => getTotalLiquidityByLp(tokenAddress, accounts),
    {
      // Execute only when tokenAddress is available.
      enabled: !!(tokenAddress && accounts),
    },
  );

  const {
    data: tokenAllowance,
    isError: tokenAllowanceError,
    refetch: refetchTokenAllowance,
  } = useQuery(
    ['tokenAllowance', chain?.chainId],
    () => {
      if (
        !accounts ||
        !chain ||
        !chain.rpc ||
        !liquidityProvidersAddress ||
        !token ||
        token[chain.chainId].address === NATIVE_ADDRESS
      )
        return;

      return getTokenAllowance(
        accounts[0],
        new ethers.providers.JsonRpcProvider(chain.rpc),
        liquidityProvidersAddress,
        token[chain.chainId].address,
      );
    },
    {
      enabled: !!(accounts && chain && liquidityProvidersAddress && token),
    },
  );

  const {
    error: approveTokenError,
    isLoading: approveTokenLoading,
    mutate: approveTokenMutation,
  } = useMutation(
    ({
      isInfiniteApproval,
      tokenAmount,
    }: {
      isInfiniteApproval: boolean;
      tokenAmount: number;
    }) => approveToken(isInfiniteApproval, tokenAmount),
  );

  const {
    error: increaseLiquidityError,
    isLoading: increaseLiquidityLoading,
    mutate: increaseLiquidityMutation,
  } = useMutation(
    async ({
      positionId,
      amount,
    }: {
      positionId: BigNumber;
      amount: BigNumber;
    }) => {
      if (!token || !chain) {
        return;
      }

      console.log('token ', token[chain.chainId].address);

      const increaseLiquidityTx =
        token[chain.chainId].address === NATIVE_ADDRESS
          ? await increaseNativeLiquidity(positionId, amount)
          : await increaseLiquidity(
              token[chain.chainId].address,
              positionId,
              amount,
            );
      // const res: any = await increaseLiquidityTx.wait(1);
      // addTxNotification(
      //   increaseLiquidityTx,
      //   'Increase liquidity',
      //   `${chain?.explorerUrl}/tx/${res.hash}`,
      // );
      return increaseLiquidityTx;
    },
  );

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    async function getWalletBalance() {
      if (!smartAccountAddress || !chain || !token) return;
      const { displayBalance } =
        (await getTokenBalance(smartAccountAddress, chain, token)) || {};
      setWalletBalance(displayBalance);
    }
    getWalletBalance();
  }, [smartAccountAddress, chain, token]);

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(totalLiquidity, tokenDecimals),
        )
      : 0;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenTotalCap, tokenDecimals),
        )
      : 0;

  const formattedSuppliedLiquidity = tokenDecimals
    ? Number.parseFloat(
        ethers.utils.formatUnits(suppliedLiquidity, tokenDecimals),
      )
    : 0;

  const formattedTokenAllowance =
    tokenAllowance && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenAllowance, tokenDecimals),
        )
      : 0;

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    const initialPoolShare =
      formattedSuppliedLiquidity && formattedTotalLiquidity
        ? Math.round(
            (formattedSuppliedLiquidity / formattedTotalLiquidity) * 100 * 100,
          ) / 100
        : 0;

    setPoolShare(initialPoolShare);
  }, [formattedSuppliedLiquidity, formattedTotalLiquidity]);

  const { code: approveTokenErrorCode } =
    (approveTokenError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};
  const { code: increaseLiquidityErrorCode } =
    (increaseLiquidityError as {
      code: number;
      message: string;
      stack: string;
    }) ?? {};

  // Check if there's an error in queries or mutations.
  const isError =
    positionMetadataError ||
    totalLiquidityError ||
    tokenTotalCapError ||
    totalLiquidityByLPError ||
    tokenAllowanceError ||
    approveTokenError ||
    increaseLiquidityError;

  useEffect(() => {
    if (isError) {
      setShowError(true);
    }
  }, [isError]);

  const isDataLoading =
    !isLoggedIn || approveTokenLoading || increaseLiquidityLoading;

  const isNativeToken =
    chain && token ? token[chain.chainId].address === NATIVE_ADDRESS : false;

  const isLiquidityAmountGtWalletBalance =
    liquidityIncreaseAmount && walletBalance
      ? Number.parseFloat(liquidityIncreaseAmount) >
        Number.parseFloat(walletBalance)
      : false;

  const isLiquidityAmountGtTokenAllowance =
    liquidityIncreaseAmount && formattedTokenAllowance >= 0
      ? Number.parseFloat(liquidityIncreaseAmount) > formattedTokenAllowance
      : false;

  const isLiquidityAmountGtPoolCap =
    liquidityIncreaseAmount && formattedTotalLiquidity && formattedTokenTotalCap
      ? Number.parseFloat(liquidityIncreaseAmount) + formattedTotalLiquidity >
        formattedTokenTotalCap
      : false;

  function reset() {
    setLiquidityIncreaseAmount('');
    setSliderValue(0);
    updatePoolShare('0');
  }

  function handleNetworkChange() {
    if (!walletProvider || !chain) return;
    switchNetwork(walletProvider, chain);
  }

  function handleLiquidityAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityIncreaseAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityIncreaseAmount);

    if (isInputValid) {
      setLiquidityIncreaseAmount(newLiquidityIncreaseAmount);
      updatePoolShare(newLiquidityIncreaseAmount);
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setLiquidityIncreaseAmount('');
      updatePoolShare('0');
    } else if (walletBalance) {
      const newLiquidityIncreaseAmount = (
        Math.trunc(Number.parseFloat(walletBalance) * (value / 100) * 1000) /
        1000
      ).toString();
      setLiquidityIncreaseAmount(newLiquidityIncreaseAmount);
      updatePoolShare(newLiquidityIncreaseAmount);
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

  function updatePoolShare(increaseInLiquidity: string) {
    if (!formattedSuppliedLiquidity) {
      return;
    }

    const increaseInLiquidityInFloat = Number.parseFloat(increaseInLiquidity);
    const newPoolShare =
      increaseInLiquidityInFloat > 0
        ? ((formattedSuppliedLiquidity + increaseInLiquidityInFloat) /
            (formattedTotalLiquidity + increaseInLiquidityInFloat)) *
          100
        : (formattedSuppliedLiquidity / formattedTotalLiquidity) * 100;

    setPoolShare(Math.round(newPoolShare * 100) / 100);
  }

  function executeTokenApproval(
    isInfiniteApproval: boolean,
    tokenAmount: number,
  ) {
    approveTokenMutation(
      { isInfiniteApproval, tokenAmount },
      {
        onSuccess: onTokenApprovalSuccess,
      },
    );
  }

  async function approveToken(
    isInfiniteApproval: boolean,
    tokenAmount: number,
  ) {
    if (
      !chain ||
      !token ||
      !signer ||
      !liquidityProvidersAddress ||
      !tokenDecimals
    ) {
      return;
    }

    const rawTokenAmount = isInfiniteApproval
      ? ethers.constants.MaxUint256
      : ethers.utils.parseUnits(tokenAmount.toString(), tokenDecimals);

    const tokenApproveTx = await giveTokenAllowance(
      liquidityProvidersAddress,
      signer,
      token[chain.chainId].address,
      rawTokenAmount,
    );
    addTxNotification(
      tokenApproveTx,
      'Token approval',
      `${chain.explorerUrl}/tx/${tokenApproveTx.hash}`,
    );
    return await tokenApproveTx.wait(1);
  }

  async function onTokenApprovalSuccess() {
    if (!accounts || !token || !chain || !liquidityProvidersAddress) {
      return;
    }

    refetchTokenAllowance();
  }

  function handleConfirmSupplyClick() {
    if (!token || !chain || !tokenDecimals) {
      return;
    }

    increaseLiquidityMutation(
      {
        positionId: BigNumber.from(positionId),
        amount: ethers.utils.parseUnits(liquidityIncreaseAmount, tokenDecimals),
      },
      {
        onSuccess: onIncreaseLiquiditySuccess,
      },
    );
  }

  function onIncreaseLiquiditySuccess() {
    queryClient.invalidateQueries();

    const updatedWalletBalance = walletBalance
      ? Number.parseFloat(walletBalance) -
        Number.parseFloat(liquidityIncreaseAmount)
      : undefined;
    setWalletBalance(updatedWalletBalance?.toString());
    setLiquidityIncreaseAmount('');
    setSliderValue(0);
  }

  return (
    <>
      {chain && token && liquidityIncreaseAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={chain.name}
          selectedTokenName={token.symbol}
          transferAmount={parseFloat(liquidityIncreaseAmount)}
        />
      ) : null}
      <article className="my-12 rounded-10 bg-white p-0 py-2 xl:my-24 xl:p-12.5 xl:pt-2.5">
        <header className="mt-6 mb-8 grid grid-cols-[2.5rem_1fr_4rem] items-center border-b px-10 pb-6 xl:mb-12 xl:grid-cols-3 xl:p-0 xl:pb-6">
          <div>
            <button
              className="flex items-center rounded text-hyphen-gray-400"
              onClick={() =>
                navigate(`/pools/manage-position/${chainId}/${positionId}`)
              }
            >
              <HiArrowSmLeft className="h-5 w-auto" />
            </button>
          </div>

          <h2 className="justify-self-start text-sm text-hyphen-purple xl:justify-self-center xl:text-xl">
            Increase Liquidity
          </h2>

          <div className="justify-self-end">
            <button className="text-xs text-hyphen-purple" onClick={reset}>
              Clear All
            </button>
          </div>
        </header>

        {chainId ? (
          <div className="px-2.5 xl:px-0">
            <LiquidityPositionOverview
              chainId={Number.parseInt(chainId)}
              positionId={BigNumber.from(positionId)}
            />
          </div>
        ) : null}

        <section className="mt-4 grid grid-cols-1 px-10 xl:mt-8 xl:grid-cols-2 xl:px-0">
          <div className="xl:max-h-102 mb-12 pt-9 xl:mb-0 xl:h-102 xl:border-r xl:pr-12.5">
            <div className="mb-9 hidden xl:block">
              <ProgressBar
                currentProgress={formattedTotalLiquidity}
                totalProgress={formattedTokenTotalCap}
              />
              <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
                <span>Pool cap</span>
                <span className="flex">
                  <>
                    {makeNumberCompact(formattedTotalLiquidity)} {token?.symbol}{' '}
                    / {makeNumberCompact(formattedTokenTotalCap)}{' '}
                    {token?.symbol}
                  </>
                </span>
              </div>
            </div>

            <div className="relative mb-6">
              <label
                htmlFor="liquidityIncreaseAmount"
                className="mb-2 flex justify-between px-5 text-xxxs font-bold uppercase xl:text-xxs"
              >
                <span className="text-hyphen-gray-400">Input</span>
                <span className="flex items-center text-hyphen-gray-300">
                  Balance:{' '}
                  {walletBalance ? (
                    walletBalance
                  ) : (
                    <Skeleton
                      baseColor="#615ccd20"
                      enableAnimation
                      highlightColor="#615ccd05"
                      className="!mx-1 !w-11"
                    />
                  )}{' '}
                  {token?.symbol}
                </span>
              </label>

              <input
                id="liquidityIncreaseAmount"
                placeholder="0.000"
                type="number"
                inputMode="decimal"
                className="h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-sm text-hyphen-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200 xl:text-2xl"
                value={liquidityIncreaseAmount}
                onChange={handleLiquidityAmountChange}
                disabled={isDataLoading}
              />

              <button
                className="absolute right-[18px] top-[42px] ml-2 flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white xl:top-[45px]"
                onClick={handleMaxButtonClick}
                disabled={isDataLoading}
              >
                MAX
              </button>
            </div>

            <StepSlider
              disabled={isDataLoading}
              dots
              onChange={handleSliderChange}
              step={25}
              value={sliderValue}
            />

            {isLoggedIn ? (
              <>
                {currentChainId === chain?.chainId ? (
                  <>
                    <button
                      className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                      disabled={
                        isDataLoading ||
                        liquidityIncreaseAmount === '' ||
                        Number.parseFloat(liquidityIncreaseAmount) === 0 ||
                        isLiquidityAmountGtWalletBalance ||
                        isLiquidityAmountGtPoolCap
                      }
                      onClick={handleConfirmSupplyClick}
                    >
                      {!walletBalance
                        ? 'Getting your balance'
                        : liquidityIncreaseAmount === '' ||
                          Number.parseFloat(liquidityIncreaseAmount) === 0
                        ? 'Enter Amount'
                        : isLiquidityAmountGtWalletBalance
                        ? 'Insufficient wallet balance'
                        : isLiquidityAmountGtPoolCap
                        ? 'This amount exceeds the pool cap'
                        : increaseLiquidityLoading
                        ? 'Increasing Liquidity'
                        : 'Confirm Supply'}
                    </button>
                  </>
                ) : (
                  <button
                    className="mt-[6.75rem] mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                    onClick={handleNetworkChange}
                  >
                    Switch to {chain?.name}
                  </button>
                )}
              </>
            ) : (
              <button
                className="mt-[6.75rem] mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                onClick={connect}
              >
                {loading ? 'Setting up you wallet...' : 'Connect Your Wallet'}
              </button>
            )}
          </div>
          <div className="xl:max-h-102 flex flex-col justify-between xl:h-102 xl:pt-3 xl:pl-12.5">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="mb-[3.125rem] flex flex-col xl:mb-0">
                <span className="pl-5 text-xxxs font-bold uppercase text-hyphen-gray-400 xl:text-xxs">
                  Updated pool share
                </span>
                <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-sm text-hyphen-gray-400 xl:text-2xl">
                  {poolShare}%
                </div>
              </div>
            </div>
            <LiquidityInfo />
          </div>
        </section>

        {isError && showError ? (
          <article className="relative mt-6 flex  h-12 items-center justify-center rounded-xl bg-red-100 p-2 text-sm text-red-600">
            <div className="flex items-center">
              <HiOutlineEmojiSad className="mr-4 h-6 w-6 text-red-400" />
              <span className="text-hyphen-gray-400">
                {approveTokenError && approveTokenErrorCode !== 4001
                  ? 'Something went wrong while approving this token, please try again later.'
                  : approveTokenError && approveTokenErrorCode === 4001
                  ? 'User rejected the transaction'
                  : increaseLiquidityError &&
                    increaseLiquidityErrorCode !== 4001
                  ? 'Something went wrong while increasing liquidity, please try again later.'
                  : increaseLiquidityError &&
                    increaseLiquidityErrorCode === 4001
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
    </>
  );
}

export default IncreaseLiquidity;
