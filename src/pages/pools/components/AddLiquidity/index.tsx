import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HiArrowSmLeft } from 'react-icons/hi';
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
import { chains } from 'config/chains';
import tokens from 'config/tokens';
import { LiquidityProviders } from 'config/liquidityContracts/LiquidityProviders';

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
  const { fromChain } = useChains()!;
  const { addTxNotification } = useNotifications()!;

  // States
  const chainOptions = useMemo(() => {
    return chains.map(chainObj => {
      return {
        id: chainObj.chainId,
        name: chainObj.name,
        image: chainObj.image,
        symbol: chainObj.currency,
      };
    });
  }, []);
  const [selectedChain, setSelectedChain] = useState<Option | undefined>();
  const chain = selectedChain
    ? chains.find(chainObj => chainObj.chainId === selectedChain.id)
    : undefined;
  const v2GraphEndpoint = chain?.v2GraphURL;

  // Liquidity Contracts
  const liquidityProvidersAddress = chain
    ? LiquidityProviders[chain.chainId].address
    : undefined;
  const { addLiquidity, addNativeLiquidity, getTotalLiquidity } =
    useLiquidityProviders(chain);
  const { getTokenTotalCap, getTokenWalletCap, getTotalLiquidityByLp } =
    useWhitelistPeriodManager(chain);

  const tokenOptions = useMemo(() => {
    return selectedChain
      ? tokens
          .filter(
            tokenObj =>
              tokenObj[selectedChain.id] &&
              tokenObj[selectedChain.id].isSupported,
          )
          .map(tokenObj => ({
            id: tokenObj.symbol,
            name: tokenObj.symbol,
            image: tokenObj.image,
          }))
      : tokens.map(tokenObj => ({
          id: tokenObj.symbol,
          name: tokenObj.symbol,
          image: tokenObj.image,
        }));
  }, [selectedChain]);
  const [selectedToken, setSelectedToken] = useState<Option | undefined>();

  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | undefined
  >();
  const [liquidityBalance, setLiquidityBalance] = useState<
    string | undefined
  >();
  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [poolShare, setPoolShare] = useState<number>(0);

  const tokenDecimals = useMemo(() => {
    if (!chainId || !tokenSymbol) return undefined;
    const token = tokens.find(token => token.symbol === tokenSymbol)!;
    return token[Number.parseInt(chainId)].decimal;
  }, [chainId, tokenSymbol]);

  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();

  // Queries
  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', selectedTokenAddress],
    () => getTotalLiquidity(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: tokenTotalCap } = useQuery(
    ['tokenTotalCap', selectedTokenAddress],
    () => getTokenTotalCap(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: tokenWalletCap } = useQuery(
    ['tokenWalletCap', selectedTokenAddress],
    () => getTokenWalletCap(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: feeAPYData } = useQuery(
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

  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useQuery(
    'tokenAllowance',
    () => {
      if (
        !accounts ||
        !chain ||
        !liquidityProvidersAddress ||
        !selectedTokenAddress ||
        selectedTokenAddress === NATIVE_ADDRESS
      )
        return;

      return getTokenAllowance(
        accounts[0],
        new ethers.providers.JsonRpcProvider(chain.rpcUrl),
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
    isLoading: approveTokenLoading,
    isSuccess: approveTokenSuccess,
    data: approveTokenTx,
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
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
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

      const token = tokens.find(
        tokenObj => tokenObj.symbol === selectedToken.id,
      )!;

      const addLiquidityTx =
        token[currentChainId].address === NATIVE_ADDRESS
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

  const { data: totalLiquidityByLP } = useQuery(
    ['totalLiquidityByLP', selectedTokenAddress],
    () => getTotalLiquidityByLp(selectedTokenAddress, accounts),
    {
      // Execute only when selectedTokenAddress and accounts are available.
      enabled: !!(selectedTokenAddress && accounts),
    },
  );

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(totalLiquidity, tokenDecimals),
        )
      : -1;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenTotalCap, tokenDecimals),
        )
      : -1;

  const formattedTokenAllowance =
    tokenAllowance && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenAllowance, tokenDecimals),
        )
      : -1;

  const rewardAPY = 0;
  const feeAPY = feeAPYData
    ? Number.parseFloat(Number.parseFloat(feeAPYData.apy).toFixed(2))
    : -1;
  const APY = rewardAPY + feeAPY;

  const isDataLoading =
    !liquidityBalance || approveTokenLoading || addLiquidityLoading;

  const isNativeToken = selectedTokenAddress === NATIVE_ADDRESS;

  const isLiquidityAmountGtWalletBalance =
    liquidityAmount && walletBalance
      ? Number.parseFloat(liquidityAmount) > Number.parseFloat(walletBalance)
      : false;

  const isLiquidityAmountGtLiquidityBalance =
    liquidityAmount && liquidityBalance
      ? Number.parseFloat(liquidityAmount) > Number.parseFloat(liquidityBalance)
      : false;

  const isLiquidityAmountGtTokenAllowance =
    liquidityAmount && formattedTokenAllowance >= 0
      ? Number.parseFloat(liquidityAmount) > formattedTokenAllowance
      : false;

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    const chain = chainId
      ? chainOptions.find(chainObj => chainObj.id === Number.parseInt(chainId))
      : chainOptions[0];
    const token = tokenSymbol
      ? tokenOptions.find(tokenObj => tokenObj.id === tokenSymbol)
      : tokenOptions[0];

    setSelectedChain(chain);
    setSelectedToken(token);
  }, [chainId, chainOptions, tokenOptions, tokenSymbol]);

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    if (tokenWalletCap && totalLiquidityByLP && tokenDecimals) {
      const balance = ethers.utils.formatUnits(
        tokenWalletCap.sub(totalLiquidityByLP),
        tokenDecimals,
      );
      setLiquidityBalance(balance);
    }
  }, [tokenDecimals, tokenWalletCap, totalLiquidityByLP]);

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  // Refactor tokenApproval using useQuery (see IncreaseLiquidity component.)
  useEffect(() => {
    async function handleTokenChange() {
      if (!chainId || !tokenSymbol || !liquidityProvidersAddress) {
        return null;
      }

      const chain = chains.find(
        chainObj => chainObj.chainId === Number.parseInt(chainId),
      )!;
      const token = tokens.find(tokenObj => tokenObj.symbol === tokenSymbol)!;

      if (isLoggedIn && accounts) {
        const { displayBalance } =
          (await getTokenBalance(accounts[0], chain, token)) || {};
        setWalletBalance(displayBalance);
      }

      setSelectedTokenAddress(token[chain.chainId].address);
    }

    handleTokenChange();
  }, [accounts, chainId, isLoggedIn, liquidityProvidersAddress, tokenSymbol]);

  function reset() {
    setLiquidityAmount('');
    setLiquidityBalance(undefined);
    setSelectedTokenAddress(undefined);
    setSliderValue(0);
    setWalletBalance(undefined);
    updatePoolShare('0');
  }

  function handleTokenChange(selectedToken: Option) {
    const { symbol: tokenSymbol } = tokens.find(
      tokenObj => tokenObj.symbol === selectedToken.id,
    )!;
    queryClient.removeQueries();
    reset();
    navigate(`/pools/add-liquidity/${chainId}/${tokenSymbol}`);
  }

  function handleChainChange(selectedChain: Option) {
    const { chainId } = chains.find(
      chainObj => chainObj.chainId === selectedChain.id,
    )!;
    const [{ symbol: tokenSymbol }] = tokens.filter(
      tokenObj => tokenObj[chainId] && tokenObj[chainId].isSupported,
    );
    queryClient.removeQueries();
    reset();
    navigate(`/pools/add-liquidity/${chainId}/${tokenSymbol}`);
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
              onClick={() => navigate(-1)}
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
          <div className="max-h-100 h-100 border-r pr-12.5">
            <div className="mb-6 grid grid-cols-2 gap-2.5">
              <Select
                options={tokenOptions}
                selected={selectedToken}
                setSelected={tokenOption => {
                  handleTokenChange(tokenOption);
                  reset();
                }}
                label={'asset'}
              />
              <Select
                options={chainOptions}
                selected={selectedChain}
                setSelected={chainOption => {
                  handleChainChange(chainOption);
                  reset();
                }}
                label={'network'}
              />
            </div>
            <label
              htmlFor="liquidityAmount"
              className="flex justify-between px-5 text-xxs font-bold uppercase"
            >
              <span className="text-hyphen-gray-400">Input</span>
              <span className="flex text-hyphen-gray-300">
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
              className="mt-2 mb-6 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200"
              value={liquidityAmount}
              onChange={handleLiquidityAmountChange}
              disabled={isDataLoading || !totalLiquidity}
            />
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
                      className="mt-10 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                      disabled={
                        isDataLoading ||
                        isNativeToken ||
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
                        isLiquidityAmountGtLiquidityBalance ||
                        isLiquidityAmountGtTokenAllowance
                      }
                    >
                      {!liquidityBalance
                        ? 'Getting your balance'
                        : liquidityAmount === '' ||
                          Number.parseFloat(liquidityAmount) === 0
                        ? 'Enter Amount'
                        : isLiquidityAmountGtWalletBalance
                        ? 'Insufficient wallet balance'
                        : isLiquidityAmountGtLiquidityBalance
                        ? 'This amount exceeds your wallet cap'
                        : addLiquidityLoading
                        ? 'Adding Liquidity'
                        : 'Confirm Supply'}
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
          <div className="max-h-100 h-100 pl-12.5">
            <div className="mb-12 grid grid-cols-2 gap-2.5">
              <div className="flex flex-col">
                <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                  APY
                </span>
                <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                  {APY >= 0 ? `${APY}%` : '...'}
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

            <div className="mb-[4.375rem]">
              <ProgressBar
                currentProgress={formattedTotalLiquidity}
                totalProgress={formattedTokenTotalCap}
              />
              <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
                <span>Pool cap</span>
                <span className="flex">
                  {formattedTotalLiquidity >= 0 &&
                  formattedTokenTotalCap >= 0 ? (
                    <>
                      {makeNumberCompact(formattedTotalLiquidity)}{' '}
                      {selectedToken?.name} /{' '}
                      {makeNumberCompact(formattedTokenTotalCap)}{' '}
                      {selectedToken?.name}
                    </>
                  ) : (
                    <Skeleton
                      baseColor="#615ccd20"
                      enableAnimation
                      highlightColor="#615ccd05"
                      className="!mx-1 !w-20"
                    />
                  )}
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
