import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const queryClient = useQueryClient();
  const {
    accounts,
    connect,
    currentChainId,
    isLoggedIn,
    signer,
    walletProvider,
  } = useWalletProvider()!;
  const { fromChain, selectedNetwork, changeSelectedNetwork } = useChains()!;
  const { addTxNotification } = useNotifications()!;

  const { addLiquidity, addNativeLiquidity, getTotalLiquidity } =
    useLiquidityProviders(selectedNetwork);
  const { getTokenTotalCap, getTokenWalletCap, getTotalLiquidityByLp } =
    useWhitelistPeriodManager(selectedNetwork);
  const liquidityProvidersAddress = selectedNetwork
    ? LiquidityProviders[selectedNetwork.chainId].address
    : undefined;

  const [selectedToken, setSelectedToken] = useState<Option | undefined>();
  const tokenDecimals = useMemo(() => {
    if (!currentChainId || !selectedToken) return undefined;
    const token = tokens.find(token => token.symbol === selectedToken?.id)!;
    return token[currentChainId].decimal;
  }, [currentChainId, selectedToken]);
  const [isSelectedTokenApproved, setIsSelectedTokenApproved] = useState<
    boolean | undefined
  >();
  const [selectedTokenAllowance, setSelectedTokenAllowance] =
    useState<BigNumber>();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | undefined
  >();
  const [chain, setChain] = useState<Option | undefined>();
  const [liquidityBalance, setLiquidityBalance] = useState<
    string | undefined
  >();
  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const [poolShare, setPoolShare] = useState<number>(0);
  const tokenOptions = useMemo(() => {
    return selectedNetwork
      ? tokens
          .filter(tokenObj => tokenObj[selectedNetwork.chainId])
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
  }, [selectedNetwork]);

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

  const {
    isVisible: isApprovalModalVisible,
    hideModal: hideApprovalModal,
    showModal: showApprovalModal,
  } = useModal();

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
      : totalLiquidity;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? Number.parseFloat(
          ethers.utils.formatUnits(tokenTotalCap, tokenDecimals),
        )
      : tokenTotalCap;

  const isDataLoading =
    !liquidityBalance || approveTokenLoading || addLiquidityLoading;

  const isLiquidityAmountGtWalletBalance =
    liquidityAmount && walletBalance
      ? Number.parseFloat(liquidityAmount) > Number.parseFloat(walletBalance)
      : false;

  const isLiquidityAmountGtLiquidityBalance =
    liquidityAmount && liquidityBalance
      ? Number.parseFloat(liquidityAmount) > Number.parseFloat(liquidityBalance)
      : false;

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
  useEffect(() => {
    if (selectedNetwork && tokenOptions) {
      setSelectedToken(tokenOptions[0]);
      setChain(
        chainOptions.find(network => network.id === selectedNetwork.chainId),
      );
    }
  }, [chainOptions, selectedNetwork, tokenOptions]);

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    async function handleTokenChange() {
      if (!selectedNetwork || !selectedToken || !liquidityProvidersAddress) {
        return null;
      }

      const token = tokens.find(
        tokenObj => tokenObj.symbol === selectedToken.id,
      )!;

      if (isLoggedIn && accounts) {
        const { displayBalance } =
          (await getTokenBalance(accounts[0], selectedNetwork, token)) || {};

        if (token[selectedNetwork.chainId].address !== NATIVE_ADDRESS) {
          const tokenAllowance = await getTokenAllowance(
            accounts[0],
            new ethers.providers.JsonRpcProvider(selectedNetwork.rpcUrl),
            liquidityProvidersAddress,
            token[selectedNetwork.chainId].address,
          );
          setSelectedTokenAllowance(tokenAllowance);
        } else {
          setIsSelectedTokenApproved(true);
        }
        setWalletBalance(displayBalance);
      }

      setSelectedTokenAddress(token[selectedNetwork.chainId].address);
    }

    handleTokenChange();
  }, [
    accounts,
    isLoggedIn,
    liquidityProvidersAddress,
    selectedNetwork,
    selectedToken,
  ]);

  function reset() {
    setLiquidityAmount('');
    setLiquidityBalance(undefined);
    setSelectedTokenAddress(undefined);
    setSelectedTokenAllowance(undefined);
    setIsSelectedTokenApproved(undefined);
    setSliderValue(0);
    setWalletBalance(undefined);
    updatePoolShare('0');
  }

  async function handleChainChange(selectedChain: Option) {
    const newChain = chains.find(
      chainObj => chainObj.chainId === selectedChain.id,
    )!;
    setChain(selectedChain);
    changeSelectedNetwork(newChain);

    if (walletProvider) {
      const res = switchNetwork(walletProvider, newChain);
      if (res === null) {
        changeSelectedNetwork(newChain);
      }
    } else {
      changeSelectedNetwork(newChain);
    }
  }

  async function handleLiquidityAmountChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityAmount);

    if (isInputValid) {
      setLiquidityAmount(newLiquidityAmount);
      updatePoolShare(newLiquidityAmount);

      if (
        newLiquidityAmount !== '' &&
        selectedTokenAddress !== NATIVE_ADDRESS &&
        selectedTokenAllowance
      ) {
        let rawLiquidityAmount = ethers.utils.parseUnits(
          newLiquidityAmount,
          tokenDecimals,
        );
        let rawLiquidityAmountHexString = rawLiquidityAmount.toHexString();

        if (selectedTokenAllowance.lt(rawLiquidityAmountHexString)) {
          setIsSelectedTokenApproved(false);
        } else {
          setIsSelectedTokenApproved(true);
        }
      } else {
        setIsSelectedTokenApproved(true);
      }
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setIsSelectedTokenApproved(undefined);
      setLiquidityAmount('');
      updatePoolShare('0');
    } else if (walletBalance && parseFloat(walletBalance) > 0) {
      const newLiquidityAmount = (
        Math.trunc(parseFloat(walletBalance) * (value / 100) * 1000) / 1000
      ).toString();
      setLiquidityAmount(newLiquidityAmount);
      updatePoolShare(newLiquidityAmount);

      if (
        newLiquidityAmount !== '' &&
        selectedTokenAddress !== NATIVE_ADDRESS &&
        selectedTokenAllowance
      ) {
        let rawLiquidityAmount = ethers.utils.parseUnits(
          newLiquidityAmount,
          tokenDecimals,
        );
        let rawLiquidityAmountHexString = rawLiquidityAmount.toHexString();

        if (selectedTokenAllowance.lt(rawLiquidityAmountHexString)) {
          setIsSelectedTokenApproved(false);
        } else {
          setIsSelectedTokenApproved(true);
        }
      } else {
        setIsSelectedTokenApproved(true);
      }
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
    if (!selectedTokenAddress || !signer || !liquidityProvidersAddress) {
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
      `${fromChain?.explorerUrl}/tx/${tokenApproveTx.hash}`,
    );
    return await tokenApproveTx.wait(1);
  }

  async function onTokenApprovalSuccess() {
    if (
      !accounts ||
      !selectedTokenAddress ||
      !selectedNetwork ||
      !liquidityProvidersAddress
    ) {
      return;
    }

    const tokenAllowance = await getTokenAllowance(
      accounts[0],
      new ethers.providers.JsonRpcProvider(selectedNetwork.rpcUrl),
      liquidityProvidersAddress,
      selectedTokenAddress,
    );
    setSelectedTokenAllowance(tokenAllowance);
    setIsSelectedTokenApproved(true);
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
    queryClient.invalidateQueries('userPositions');
    navigate('/pool');
  }

  return (
    <>
      {chain && selectedToken && liquidityAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={chain.name}
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
            <button className="mr-4 text-xs text-hyphen-purple" onClick={reset}>
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
                  setSelectedToken(tokenOption);
                  reset();
                }}
                label={'asset'}
              />
              <Select
                options={chainOptions}
                selected={chain}
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
                Your Address Limit:{' '}
                {liquidityBalance ? (
                  liquidityBalance
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
                <button
                  className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                  disabled={
                    isDataLoading ||
                    isSelectedTokenApproved ||
                    isSelectedTokenApproved === undefined
                  }
                  onClick={showApprovalModal}
                >
                  {liquidityAmount === '' && !isSelectedTokenApproved
                    ? 'Enter amount to see approval'
                    : approveTokenLoading
                    ? 'Approving Token...'
                    : isSelectedTokenApproved
                    ? `${selectedToken?.name} Approved`
                    : `Approve ${selectedToken?.name}`}
                </button>
                <button
                  className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
                  onClick={handleConfirmSupplyClick}
                  disabled={
                    isDataLoading ||
                    liquidityAmount === '' ||
                    !isSelectedTokenApproved ||
                    isLiquidityAmountGtWalletBalance ||
                    isLiquidityAmountGtLiquidityBalance
                  }
                >
                  {!liquidityBalance
                    ? 'Getting your balance'
                    : liquidityAmount === ''
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
                onClick={connect}
              >
                Connect Your Wallet
              </button>
            )}
          </div>
          <div className="max-h-100 h-100 pl-12.5">
            <div className="mb-14 grid grid-cols-2 gap-2.5">
              <div className="flex flex-col">
                <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
                  APY
                </span>
                <div className="mt-2 flex h-15 items-center rounded-2.5 bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                  81.19%
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

            <div className="mb-16">
              <ProgressBar
                currentProgress={formattedTotalLiquidity}
                totalProgress={formattedTokenTotalCap}
              />
              <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
                <span>Pool cap</span>
                <span className="flex">
                  {formattedTotalLiquidity && formattedTokenTotalCap ? (
                    <>
                      {makeNumberCompact(formattedTotalLiquidity)}
                      {selectedToken?.name} /{' '}
                      {makeNumberCompact(formattedTokenTotalCap)}
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
