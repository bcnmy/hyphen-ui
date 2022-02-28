import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiAdjustments, HiArrowSmLeft } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import ProgressBar from 'components/ProgressBar';
import Select, { Option } from 'components/Select';
import LiquidityInfo from '../LiquidityInfo';
import StepSlider from '../StepSlider';
import { useToken } from 'context/Token';
import { useWalletProvider } from 'context/WalletProvider';
import switchNetwork from 'utils/switchNetwork';
import getTokenBalance from 'utils/getTokenBalance';
import { BigNumber, ethers } from 'ethers';
import erc20ABI from 'abis/erc20.abi.json';
import Skeleton from 'react-loading-skeleton';
import { useMutation, useQuery } from 'react-query';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import useWhitelistPeriodManager from 'hooks/useWhitelistPeriodManager';
import { NATIVE_ADDRESS } from 'config/constants';
import getTokenAllowance from 'utils/getTokenAllowance';
import ApprovalModal from 'pages/bridge/components/ApprovalModal';
import useModal from 'hooks/useModal';
import setTokenAllowance from 'utils/giveTokenAllowance';
import { useNotifications } from 'context/Notifications';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import { chains } from 'config/chains';
import tokens from 'config/tokens';

interface IAddLiquidity {
  apy: number;
  currentLiquidity: number;
  network: string;
  tokenSymbol: string;
  totalLiquidity: number;
}

function AddLiquidity() {
  const navigate = useNavigate();
  const { accounts, currentChainId, walletProvider } = useWalletProvider()!;
  const { fromChain } = useChains()!;
  const { addTxNotification } = useNotifications()!;
  const { addTokenLiquidity, getTotalLiquidity } = useLiquidityProviders();
  const { getTokenTotalCap, getTokenWalletCap, getTotalLiquidityByLP } =
    useWhitelistPeriodManager();

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
  const [selectedNetwork, setSelectedNetwork] = useState<Option | undefined>();
  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const [poolShare, setPoolShare] = useState<number>(0);
  const tokenOptions = useMemo(() => {
    if (!currentChainId) return [];
    return tokens
      .filter(tokenObj => tokenObj[currentChainId])
      .map(tokenObj => ({
        id: tokenObj.symbol,
        name: tokenObj.symbol,
        image: tokenObj.image,
      }));
  }, [currentChainId]);
  const networkOptions = useMemo(() => {
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
      // Execute only when accounts are available.
      enabled: !!selectedTokenAddress,
    },
  );

  const { data: tokenWalletCap } = useQuery(
    ['tokenWalletCap', selectedTokenAddress],
    () => getTokenWalletCap(selectedTokenAddress),
    {
      // Execute only when accounts are available.
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
    isLoading: addTokenLiquidityLoading,
    isSuccess: addTokenLiquiditySuccess,
    data: addTokenLiquidityTx,
    mutate: addTokenLiquidityMutation,
  } = useMutation(
    async ({
      tokenAddress,
      amount,
    }: {
      tokenAddress: string;
      amount: BigNumber;
    }) => {
      const addTokenLiquidityTx = await addTokenLiquidity(tokenAddress, amount);
      addTxNotification(
        addTokenLiquidityTx,
        'Add liquidity',
        `${fromChain?.explorerUrl}/tx/${addTokenLiquidityTx.hash}`,
      );
      return await addTokenLiquidityTx.wait(1);
    },
  );

  // TODO: Will be taken care by SDK.
  // const { data: totalLiquidityByLP } = useQuery(
  //   ['totalLiquidityByLP', selectedTokenAddress],
  //   () => getTotalLiquidityByLP(selectedTokenAddress),
  //   {
  //     // Execute only when selectedTokenAddress is available.
  //     enabled: !!selectedTokenAddress,
  //   },
  // );

  // if (totalLiquidityByLP) {
  //   console.log(totalLiquidityByLP.toString());
  // }

  const formattedTotalLiquidity =
    totalLiquidity && tokenDecimals
      ? totalLiquidity / 10 ** tokenDecimals
      : totalLiquidity;

  const formattedTokenTotalCap =
    tokenTotalCap && tokenDecimals
      ? tokenTotalCap / 10 ** tokenDecimals
      : tokenTotalCap;

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    setSelectedToken(tokenOptions[0]);
    setSelectedNetwork(
      networkOptions.find(network => network.id === currentChainId),
    );
  }, [currentChainId, networkOptions, tokenOptions]);

  // TODO: Clean up hooks so that React doesn't throw state updates on unmount warning.
  useEffect(() => {
    async function handleTokenChange() {
      if (!accounts || !currentChainId || !selectedToken) {
        return null;
      }

      const chain = chains.find(
        chainObj => chainObj.chainId === currentChainId,
      )!;
      const token = tokens.find(
        tokenObj => tokenObj.symbol === selectedToken.id,
      )!;
      const { displayBalance } = await getTokenBalance(
        accounts[0],
        chain,
        token,
      );
      if (token[currentChainId].address !== NATIVE_ADDRESS) {
        const tokenAllowance = await getTokenAllowance(
          accounts[0],
          '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
          token[currentChainId].address,
        );
        setSelectedTokenAllowance(tokenAllowance);
      } else {
        setIsSelectedTokenApproved(true);
      }
      setSelectedTokenAddress(token[currentChainId].address);
      setWalletBalance(displayBalance);
    }

    setWalletBalance(undefined);
    setSelectedTokenAddress(undefined);
    setSelectedTokenAllowance(undefined);
    setIsSelectedTokenApproved(undefined);
    handleTokenChange();
  }, [accounts, currentChainId, selectedToken]);

  async function handleNetworkChange(selectedNetwork: Option) {
    const network = chains.find(chain => chain.chainId === selectedNetwork.id);
    if (walletProvider && network) {
      const res = await switchNetwork(walletProvider, network);
      if (res === null) {
        setSelectedNetwork(selectedNetwork);
      }
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
    const rawTokenAmount = isInfiniteApproval
      ? ethers.constants.MaxUint256
      : ethers.utils.parseUnits(tokenAmount.toString(), tokenDecimals);

    if (selectedTokenAddress) {
      const tokenApproveTx = await setTokenAllowance(
        '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
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
  }

  async function onTokenApprovalSuccess() {
    if (accounts && selectedTokenAddress) {
      const tokenAllowance = await getTokenAllowance(
        accounts[0],
        '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
        selectedTokenAddress,
      );
      setSelectedTokenAllowance(tokenAllowance);
      setIsSelectedTokenApproved(true);
    }
  }

  function handleConfirmSupplyClick() {
    if (selectedTokenAddress && liquidityAmount && tokenDecimals) {
      addTokenLiquidityMutation(
        {
          tokenAddress: selectedTokenAddress,
          amount: ethers.utils.parseUnits(liquidityAmount, tokenDecimals),
        },
        {
          onSuccess: onAddTokenLiquiditySuccess,
        },
      );
    }
  }

  function onAddTokenLiquiditySuccess() {
    navigate('/pool');
  }

  return (
    <>
      {selectedNetwork && selectedToken && liquidityAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={selectedNetwork.name}
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
            <button className="mr-4 text-xs text-hyphen-purple">
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
                }}
                label={'asset'}
              />
              <Select
                options={networkOptions}
                selected={selectedNetwork}
                setSelected={networkOption =>
                  handleNetworkChange(networkOption)
                }
                label={'network'}
              />
            </div>
            <label
              htmlFor="liquidityAmount"
              className="flex justify-between px-5 text-xxs font-bold uppercase"
            >
              <span className="text-hyphen-gray-400">Input</span>
              <span className="flex text-hyphen-gray-300">
                Your address limit:{' '}
                {walletBalance ? (
                  walletBalance
                ) : (
                  <Skeleton
                    baseColor="#615ccd20"
                    enableAnimation={!!selectedToken}
                    highlightColor="#615ccd05"
                    className="!ml-1 !w-11"
                  />
                )}
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
              disabled={
                !totalLiquidity ||
                approveTokenLoading ||
                addTokenLiquidityLoading
              }
            />
            <StepSlider
              disabled={approveTokenLoading || addTokenLiquidityLoading}
              dots
              onChange={handleSliderChange}
              step={25}
              value={sliderValue}
            />
            <button
              className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
              disabled={
                isSelectedTokenApproved ||
                isSelectedTokenApproved === undefined ||
                approveTokenLoading ||
                addTokenLiquidityLoading
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
                liquidityAmount === '' ||
                !isSelectedTokenApproved ||
                addTokenLiquidityLoading
              }
            >
              {addTokenLiquidityLoading
                ? 'Adding Liquidity...'
                : 'Confirm Supply'}
            </button>
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
                <span>
                  {makeNumberCompact(formattedTotalLiquidity) || '...'}{' '}
                  {selectedToken?.name} /{' '}
                  {makeNumberCompact(formattedTokenTotalCap) || '...'}{' '}
                  {selectedToken?.name}
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
