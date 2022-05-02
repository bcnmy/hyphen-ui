import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowSmLeft, HiOutlineXCircle } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import ProgressBar from 'components/ProgressBar';
import Select, { Option } from 'components/Select';
import LiquidityInfo from '../LiquidityInfo';
import StepSlider from '../StepSlider';
import { useWalletProvider } from 'context/WalletProvider';
import switchNetwork from 'utils/switchNetwork';
import getTokenBalance from 'utils/getTokenBalance';
import { BigNumber, ethers } from 'ethers';
import Skeleton from 'react-loading-skeleton';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { request, gql } from 'graphql-request';
import useLiquidityProviders from 'hooks/contracts/useLiquidityProviders';
import useWhitelistPeriodManager from 'hooks/contracts/useWhitelistPeriodManager';
import { NATIVE_ADDRESS } from 'config/constants';
import getTokenAllowance from 'utils/getTokenAllowance';
import ApprovalModal from 'pages/bridge/components/ApprovalModal';
import useModal from 'hooks/useModal';
import giveTokenAllowance from 'utils/giveTokenAllowance';
import { useNotifications } from 'context/Notifications';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import useLiquidityFarming from 'hooks/contracts/useLiquidityFarming';
import { useToken } from 'context/Token';

function AddLiquidity() {
  const navigate = useNavigate();
  const { chainId, tokenSymbol } = useParams();
  const queryClient = useQueryClient();

  const {
    accounts,
    connect,
    currentChainId,
    isLoggedIn,
    signer,
    walletProvider,
  } = useWalletProvider()!;
  const { fromChain, networks } = useChains()!;
  const { tokens } = useToken()!;
  const { addTxNotification } = useNotifications()!;

  // States
  const chainOptions = useMemo(() => {
    return networks?.map(chainObj => {
      return {
        id: chainObj.chainId,
        name: chainObj.name,
        image: chainObj.image,
        symbol: chainObj.currency,
      };
    });
  }, [networks]);
  const [selectedChain, setSelectedChain] = useState<Option | undefined>();
  const chain = selectedChain
    ? networks?.find(networkObj => networkObj.chainId === selectedChain.id)
    : undefined;
  const v2GraphEndpoint = chain?.v2GraphUrl;

  // Liquidity Contracts
  const liquidityProvidersAddress = chain
    ? chain.contracts.hyphen.liquidityProviders
    : undefined;
  const {
    addLiquidity,
    addNativeLiquidity,
    getSuppliedLiquidityByToken,
    getTotalLiquidity,
  } = useLiquidityProviders(chain);
  const { getTokenTotalCap } = useWhitelistPeriodManager(chain);
  const { getRewardRatePerSecond, getRewardTokenAddress } =
    useLiquidityFarming(chain);

  const tokenOptions = useMemo(() => {
    if (!tokens) {
      return [];
    }

    return selectedChain
      ? Object.keys(tokens)
          .filter(tokenSymbol => {
            const tokenObj = tokens[tokenSymbol];
            return (
              tokenObj[selectedChain.id] &&
              (tokenObj[selectedChain.id].isSupported ||
                tokenObj[selectedChain.id].isSupported === undefined)
            );
          })
          .map(tokenSymbol => {
            const tokenObj = tokens[tokenSymbol];
            return {
              id: tokenObj.symbol,
              name: tokenObj.symbol,
              image: tokenObj.image,
            };
          })
      : Object.keys(tokens).map(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return {
            id: tokenObj.symbol,
            name: tokenObj.symbol,
            image: tokenObj.image,
          };
        });
  }, [selectedChain, tokens]);
  const [selectedToken, setSelectedToken] = useState<Option | undefined>();

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | undefined
  >();
  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [poolShare, setPoolShare] = useState<number>(0);

  const token = tokens && tokenSymbol ? tokens[tokenSymbol] : undefined;
  const tokenDecimals =
    chain && token ? token[chain.chainId].decimal : undefined;

  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();

  // Queries
  const { data: totalLiquidity, isError: totalLiquidityError } = useQuery(
    ['totalLiquidity', selectedTokenAddress],
    () => getTotalLiquidity(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: tokenTotalCap, isError: tokenTotalCapError } = useQuery(
    ['tokenTotalCap', selectedTokenAddress],
    () => getTokenTotalCap(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: feeAPYData, isError: feeAPYDataError } = useQuery(
    ['apy', selectedTokenAddress],
    async () => {
      if (!v2GraphEndpoint || !selectedTokenAddress) return;

      const { rollingApyFor24Hour } = await request(
        v2GraphEndpoint,
        gql`
          query {
            rollingApyFor24Hour(id: "${selectedTokenAddress.toLowerCase()}") {
              apy
            }
          }
        `,
      );
      return rollingApyFor24Hour;
    },
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const {
    data: tokenAllowance,
    isError: tokenAllowanceError,
    refetch: refetchTokenAllowance,
  } = useQuery(
    'tokenAllowance',
    () => {
      if (
        !accounts ||
        !chain ||
        !chain.rpc ||
        !liquidityProvidersAddress ||
        !selectedTokenAddress ||
        selectedTokenAddress === NATIVE_ADDRESS
      )
        return;

      return getTokenAllowance(
        accounts[0],
        new ethers.providers.JsonRpcProvider(chain.rpc),
        liquidityProvidersAddress,
        selectedTokenAddress,
      );
    },
    {
      enabled: !!(
        accounts &&
        chain &&
        liquidityProvidersAddress &&
        selectedTokenAddress
      ),
    },
  );

  // Mutations
  const {
    isError: approveTokenError,
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
    isError: addLiquidityError,
    isLoading: addLiquidityLoading,
    mutate: addLiquidityMutation,
  } = useMutation(
    async ({
      amount,
      tokenAddress,
    }: {
      amount: BigNumber;
      tokenAddress: string | '';
    }) => {
      if (!selectedToken || !currentChainId) {
        return;
      }

      const token = tokens ? tokens[selectedToken.id] : undefined;

      const addLiquidityTx =
        token && token[currentChainId].address === NATIVE_ADDRESS
          ? await addNativeLiquidity(amount)
          : await addLiquidity(tokenAddress, amount);
      addTxNotification(
        addLiquidityTx,
        'Add liquidity',
        `${fromChain?.explorerUrl}/tx/${addLiquidityTx.hash}`,
      );
      return await addLiquidityTx.wait(1);
    },
  );

  const {
    data: suppliedLiquidityByToken,
    isError: suppliedLiquidityByTokenError,
  } = useQuery(
    ['suppliedLiquidityByToken', selectedTokenAddress],
    () => {
      if (!selectedTokenAddress) return;

      return getSuppliedLiquidityByToken(selectedTokenAddress);
    },
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: tokenPriceInUSD, isError: tokenPriceInUSDError } = useQuery(
    ['tokenPriceInUSD', token],
    () =>
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token?.coinGeckoId}&vs_currencies=usd`,
      ).then(res => res.json()),
    {
      enabled: !!token,
    },
  );

  const { data: rewardsRatePerSecond, isError: rewardsRatePerSecondError } =
    useQuery(
      ['rewardsRatePerSecond', selectedTokenAddress],
      () => {
        if (!selectedTokenAddress) return;

        return getRewardRatePerSecond(selectedTokenAddress);
      },
      {
        // Execute only when selectedTokenAddress is available.
        enabled: !!selectedTokenAddress,
      },
    );

  const { data: rewardTokenAddress, isError: rewardTokenAddressError } =
    useQuery(
      ['rewardTokenAddress', selectedTokenAddress],
      () => {
        if (!selectedTokenAddress) return;

        return getRewardTokenAddress(selectedTokenAddress);
      },
      {
        // Execute only when selectedTokenAddress is available.
        enabled: !!selectedTokenAddress,
      },
    );

  const rewardTokenSymbol =
    rewardTokenAddress && tokens && chain
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

  const { data: rewardTokenPriceInUSD, isError: rewardTokenPriceInUSDError } =
    useQuery(
      ['rewardTokenPriceInUSD', rewardToken?.coinGeckoId],
      () => {
        if (!rewardToken) return;

        return fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${rewardToken.coinGeckoId}&vs_currencies=usd`,
        ).then(res => res.json());
      },
      {
        enabled: !!rewardToken,
      },
    );

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    const chain = chainId
      ? chainOptions?.find(chainObj => chainObj.id === Number.parseInt(chainId))
      : undefined;
    const token = tokenSymbol
      ? tokenOptions.find(tokenObj => tokenObj.id === tokenSymbol)
      : tokenOptions[0];

    console.log(tokenOptions);

    setSelectedChain(chain);
    setSelectedToken(token);
  }, [chainId, chainOptions, tokenOptions, tokenSymbol]);

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  // Refactor tokenApproval using useQuery (see IncreaseLiquidity component.)
  useEffect(() => {
    async function handleTokenChange() {
      if (!chainId || !tokenSymbol || !liquidityProvidersAddress) {
        return null;
      }

      const chain = networks?.find(
        networkObj => networkObj.chainId === Number.parseInt(chainId),
      )!;
      const token = tokens ? tokens[tokenSymbol] : undefined;

      if (isLoggedIn && accounts) {
        const { displayBalance } =
          (await getTokenBalance(accounts[0], chain, token)) || {};
        setWalletBalance(displayBalance);
      }

      if (token) {
        setSelectedTokenAddress(token[chain.chainId].address);
      }
    }

    handleTokenChange();
  }, [
    accounts,
    chainId,
    isLoggedIn,
    liquidityProvidersAddress,
    networks,
    tokenSymbol,
    tokens,
  ]);

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

  const formattedTokenAllowance =
    tokenAllowance && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenAllowance, tokenDecimals),
        )
      : 0;

  const rewardRatePerSecondInUSD =
    rewardsRatePerSecond && rewardTokenPriceInUSD && chain && rewardToken
      ? Number.parseFloat(
          ethers.utils.formatUnits(
            rewardsRatePerSecond,
            rewardToken[chain.chainId].decimal,
          ),
        ) * rewardTokenPriceInUSD[rewardToken.coinGeckoId as string].usd
      : 0;

  const totalValueLockedInUSD =
    suppliedLiquidityByToken && tokenPriceInUSD && token && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(suppliedLiquidityByToken, tokenDecimals),
        ) * tokenPriceInUSD[token.coinGeckoId as string].usd
      : 0;

  const secondsInYear = 31536000;
  const rewardAPY =
    rewardRatePerSecondInUSD && totalValueLockedInUSD
      ? (Math.pow(
          1 + rewardRatePerSecondInUSD / totalValueLockedInUSD,
          secondsInYear,
        ) -
          1) *
        100
      : 0;

  const feeAPY = feeAPYData
    ? Number.parseFloat(Number.parseFloat(feeAPYData.apy).toFixed(2))
    : 0;
  const APY = rewardAPY + feeAPY;

  // Check if there's an error in queries or mutations.
  const isError =
    totalLiquidityError ||
    tokenTotalCapError ||
    feeAPYDataError ||
    tokenAllowanceError ||
    suppliedLiquidityByTokenError ||
    tokenPriceInUSDError ||
    rewardsRatePerSecondError ||
    rewardTokenAddressError ||
    rewardTokenPriceInUSDError ||
    approveTokenError ||
    addLiquidityError;

  const isDataLoading = approveTokenLoading || addLiquidityLoading;

  if (isError) {
    return (
      <article className="my-24 flex h-100 items-center justify-center rounded-10 bg-white p-12.5">
        <div className="flex items-center">
          <HiOutlineXCircle className="mr-4 h-6 w-6 text-red-400" />
          <span className="text-hyphen-gray-400">
            {approveTokenError
              ? 'Something went wrong while approving this token, please try again later.'
              : addLiquidityError
              ? 'Something went wrong while adding liquidity, please try again later.'
              : 'We could not get the necessary information, please try again later.'}
          </span>
        </div>
      </article>
    );
  }

  const isNativeToken = selectedTokenAddress === NATIVE_ADDRESS;

  const isLiquidityAmountGtWalletBalance =
    liquidityAmount && walletBalance
      ? Number.parseFloat(liquidityAmount) > Number.parseFloat(walletBalance)
      : false;

  const isLiquidityAmountGtTokenAllowance =
    liquidityAmount && formattedTokenAllowance >= 0
      ? Number.parseFloat(liquidityAmount) > formattedTokenAllowance
      : false;

  const isLiquidityAmountGtPoolCap =
    liquidityAmount && formattedTotalLiquidity && formattedTokenTotalCap
      ? Number.parseFloat(liquidityAmount) + formattedTotalLiquidity >
        formattedTokenTotalCap
      : false;

  function reset() {
    setLiquidityAmount('');
    setSelectedTokenAddress(undefined);
    setSliderValue(0);
    setWalletBalance(undefined);
    updatePoolShare('0');
  }

  function handleTokenChange(selectedToken: Option) {
    const { symbol: newTokenSymbol } = tokens?.[selectedToken.id] ?? {};

    if (newTokenSymbol !== tokenSymbol) {
      queryClient.removeQueries();
      reset();
      navigate(`/pools/add-liquidity/${chainId}/${newTokenSymbol}`);
    }
  }

  function handleChainChange(selectedChain: Option) {
    const { chainId: newChainId } = networks?.find(
      networkObj => networkObj.chainId === selectedChain.id,
    )!;
    const newTokenSymbol = tokens
      ? Object.keys(tokens).filter(tokenSymbol => {
          const tokenObj = tokens[tokenSymbol];
          return tokenObj[newChainId] && tokenObj[newChainId].isSupported;
        })
      : [{}];

    if (chainId && newChainId !== Number.parseInt(chainId, 10)) {
      queryClient.removeQueries();
      reset();
      navigate(`/pools/add-liquidity/${newChainId}/${newTokenSymbol}`);
    }
  }

  function handleNetworkChange() {
    if (!walletProvider || !chain) return;
    switchNetwork(walletProvider, chain);
  }

  function handleLiquidityAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityAmount);

    if (isInputValid) {
      setLiquidityAmount(newLiquidityAmount);
      updatePoolShare(newLiquidityAmount);
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setLiquidityAmount('');
      updatePoolShare('0');
    } else if (walletBalance && parseFloat(walletBalance) > 0) {
      const newLiquidityAmount = (
        Math.trunc(parseFloat(walletBalance) * (value / 100) * 1000) / 1000
      ).toString();
      setLiquidityAmount(newLiquidityAmount);
      updatePoolShare(newLiquidityAmount);
    }
  }

  function handleMaxButtonClick() {
    if (walletBalance) {
      setSliderValue(100);
      setLiquidityAmount(
        (Math.trunc(Number.parseFloat(walletBalance) * 1000) / 1000).toString(),
      );
    }
  }

  function updatePoolShare(newLiquidityAmount: string) {
    const liquidityAmountInFloat = Number.parseFloat(newLiquidityAmount);

    const newPoolShare =
      liquidityAmountInFloat > 0
        ? (liquidityAmountInFloat /
            (liquidityAmountInFloat + formattedTotalLiquidity)) *
          100
        : 0;

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
      !selectedTokenAddress ||
      !signer ||
      !liquidityProvidersAddress
    ) {
      return;
    }

    const rawTokenAmount = isInfiniteApproval
      ? ethers.constants.MaxUint256
      : ethers.utils.parseUnits(tokenAmount.toString(), tokenDecimals);

    const tokenApproveTx = await giveTokenAllowance(
      liquidityProvidersAddress,
      signer,
      selectedTokenAddress,
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
    if (
      !accounts ||
      !selectedTokenAddress ||
      !chain ||
      !liquidityProvidersAddress
    ) {
      return;
    }

    refetchTokenAllowance();
  }

  function handleConfirmSupplyClick() {
    if (!selectedTokenAddress || !liquidityAmount || !tokenDecimals) {
      return;
    }

    addLiquidityMutation(
      {
        amount: ethers.utils.parseUnits(liquidityAmount, tokenDecimals),
        tokenAddress: selectedTokenAddress,
      },
      {
        onSuccess: onAddTokenLiquiditySuccess,
      },
    );
  }

  function onAddTokenLiquiditySuccess() {
    queryClient.invalidateQueries();
    navigate('/pools');
  }

  return (
    <>
      {selectedChain && selectedToken && liquidityAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={selectedChain.name}
          selectedTokenName={selectedToken.name}
          transferAmount={parseFloat(liquidityAmount)}
        />
      ) : null}
      <article className="my-24 rounded-10 bg-white p-12.5 pt-2.5">
        <header className="relative mt-6 mb-12 flex items-center justify-center border-b px-10 pb-6">
          <div className="absolute left-0">
            <button
              className="flex items-center rounded text-hyphen-gray-400"
              onClick={() => navigate('/pools')}
            >
              <HiArrowSmLeft className="h-5 w-auto" />
            </button>
          </div>

          <h2 className="text-xl text-hyphen-purple">Add Liquidity</h2>

          <div className="absolute right-0 flex">
            <button
              className="mr-4 text-xs text-hyphen-purple"
              onClick={() => {
                setLiquidityAmount('');
                setSliderValue(0);
                updatePoolShare('0');
              }}
            >
              Clear All
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2">
          <div className="max-h-104.5 h-104.5 border-r pr-12.5">
            <div className="mb-6 grid grid-cols-2 gap-2.5">
              <Select
                options={tokenOptions}
                selected={selectedToken}
                setSelected={tokenOption => {
                  handleTokenChange(tokenOption);
                }}
                label={'asset'}
              />
              <Select
                options={chainOptions}
                selected={selectedChain}
                setSelected={chainOption => {
                  handleChainChange(chainOption);
                }}
                label={'network'}
              />
            </div>

            <div className="relative mb-6">
              <label
                htmlFor="liquidityAmount"
                className="mb-2 flex justify-between px-5 text-xxs font-bold uppercase"
              >
                <span className="text-hyphen-gray-400">Input</span>
                <span className="flex items-center text-hyphen-gray-300">
                  Wallet Balance:{' '}
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
                  {selectedToken?.id}
                </span>
              </label>

              <input
                id="liquidityAmount"
                placeholder="0.000"
                type="number"
                inputMode="decimal"
                className="mb-2 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200"
                value={liquidityAmount}
                onChange={handleLiquidityAmountChange}
                disabled={isDataLoading || !totalLiquidity}
              />

              <button
                className="absolute right-[18px] top-[45px] ml-2 flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
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
                      className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                      disabled={
                        isDataLoading ||
                        isNativeToken ||
                        isLiquidityAmountGtWalletBalance ||
                        isLiquidityAmountGtPoolCap ||
                        !isLiquidityAmountGtTokenAllowance
                      }
                      onClick={showApprovalModal}
                    >
                      {liquidityAmount === '' ||
                      (Number.parseFloat(liquidityAmount) === 0 &&
                        !isLiquidityAmountGtTokenAllowance)
                        ? 'Enter amount to see approval'
                        : approveTokenLoading
                        ? 'Approving Token'
                        : isNativeToken || !isLiquidityAmountGtTokenAllowance
                        ? `${selectedToken?.name} Approved`
                        : `Approve ${selectedToken?.name}`}
                    </button>
                    <button
                      className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                      onClick={handleConfirmSupplyClick}
                      disabled={
                        isDataLoading ||
                        liquidityAmount === '' ||
                        Number.parseFloat(liquidityAmount) === 0 ||
                        isLiquidityAmountGtWalletBalance ||
                        (!isNativeToken && isLiquidityAmountGtTokenAllowance) ||
                        isLiquidityAmountGtPoolCap
                      }
                    >
                      {!walletBalance
                        ? 'Getting your balance'
                        : liquidityAmount === '' ||
                          Number.parseFloat(liquidityAmount) === 0
                        ? 'Enter Amount'
                        : isLiquidityAmountGtWalletBalance
                        ? 'Insufficient wallet balance'
                        : isLiquidityAmountGtPoolCap
                        ? 'This amount exceeds the pool cap'
                        : addLiquidityLoading
                        ? 'Adding Liquidity'
                        : 'Confirm Supply'}
                    </button>
                  </>
                ) : (
                  <button
                    className="mt-[6.75rem] h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                    onClick={handleNetworkChange}
                  >
                    Switch to {chain?.name}
                  </button>
                )}
              </>
            ) : null}
            {!isLoggedIn ? (
              <button
                className="mt-[6.75rem] h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white"
                onClick={connect}
              >
                Connect Your Wallet
              </button>
            ) : null}
          </div>
          <div className="max-h-104.5 h-104.5 pl-12.5">
            <div className="mb-12 grid grid-cols-2 gap-2.5">
              <div className="flex flex-col">
                <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                  APY
                </span>
                <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                  {APY > 10000
                    ? '>10,000%'
                    : `${Number.parseFloat(APY.toFixed(3))}%`}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                  Your pool share
                </span>
                <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                  {poolShare}%
                </div>
              </div>
            </div>

            <div className="mb-[5.5rem]">
              <ProgressBar
                currentProgress={formattedTotalLiquidity}
                totalProgress={formattedTokenTotalCap}
              />
              <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
                <span>Pool cap</span>
                <span className="flex">
                  <>
                    {makeNumberCompact(formattedTotalLiquidity)}{' '}
                    {selectedToken?.name} /{' '}
                    {makeNumberCompact(formattedTokenTotalCap)}{' '}
                    {selectedToken?.name}
                  </>
                </span>
              </div>
            </div>

            <LiquidityInfo />
          </div>
        </section>
      </article>
    </>
  );
}

export default AddLiquidity;
