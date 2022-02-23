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
import erc20ABI from 'contracts/erc20.abi.json';
import Skeleton from 'react-loading-skeleton';
import { useQuery } from 'react-query';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import useWhitelistPeriodManager from 'hooks/useWhitelistPeriodManager';
import useLPToken from 'hooks/useLPToken';
import { useHyphen } from 'context/Hyphen';
import { NATIVE_ADDRESS } from 'config/constants';
import { TokenConfig } from 'config/tokens';
import useDebounce from 'hooks/useDebounce';
import getTokenAllowance from 'utils/getTokenAllowance';

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
  const { chainsList, fromChain } = useChains()!;
  const { tokensList } = useToken()!;
  const { hyphen } = useHyphen()!;
  const { addTokenLiquidity, getTotalLiquidity } = useLiquidityProviders();
  const { getTokenTotalCap, getTokenWalletCap } = useWhitelistPeriodManager();

  const [selectedToken, setSelectedToken] = useState<Option | undefined>();
  const tokenDecimals = useMemo(() => {
    if (!currentChainId || !selectedToken) return undefined;
    const token = tokensList.find(token => token.symbol === selectedToken?.id)!;
    return token[currentChainId].decimal;
  }, [currentChainId, selectedToken, tokensList]);
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
  const [poolShare, setPoolShare] = useState<number>(0);
  const tokenOptions = useMemo(() => {
    if (!currentChainId) return [];
    return tokensList
      .filter(token => token[currentChainId])
      .map(token => ({
        id: token.symbol,
        name: token.symbol,
        image: token.image,
      }));
  }, [currentChainId, tokensList]);
  const networkOptions = useMemo(() => {
    return chainsList.map(chain => {
      return {
        id: chain.chainId,
        name: chain.name,
        image: chain.image,
        symbol: chain.currency,
      };
    });
  }, [chainsList]);

  useEffect(() => {
    setSelectedToken(tokenOptions[0]);
    setSelectedNetwork(
      networkOptions.find(network => network.id === currentChainId),
    );
  }, [currentChainId, networkOptions, tokenOptions]);

  useEffect(() => {
    async function handleTokenChange() {
      if (accounts && currentChainId && selectedToken) {
        const token = tokensList.find(
          token => token.symbol === selectedToken.id,
        )!;
        const chain = chainsList.find(
          chain => chain.chainId === currentChainId,
        )!;
        const chainRpcProvider = new ethers.providers.JsonRpcProvider(
          chain.rpcUrl,
        );
        const tokenContract = new ethers.Contract(
          token[currentChainId].address,
          erc20ABI,
          chainRpcProvider,
        );
        const { displayBalance } = await getTokenBalance(
          accounts[0],
          chain,
          chainRpcProvider,
          token,
          tokenContract,
        );
        if (token[currentChainId].address !== NATIVE_ADDRESS) {
          const tokenAllowance = await getTokenAllowance(
            accounts[0],
            '0xB4E58e519DEDb0c436f199cA5Ab3b089F8C418cC',
            token[currentChainId].address,
          );
          setSelectedTokenAllowance(tokenAllowance);
        }
        setSelectedTokenAddress(token[currentChainId].address);
        setWalletBalance(displayBalance);
        setIsSelectedTokenApproved(true);
      }
    }

    handleTokenChange();
  }, [accounts, chainsList, currentChainId, selectedToken, tokensList]);

  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', selectedTokenAddress],
    () => getTotalLiquidity(selectedTokenAddress),
    {
      // Execute only when selectedTokenAddress is available.
      enabled: !!selectedTokenAddress,
    },
  );
  const formattedTotalLiquidity = tokenDecimals
    ? totalLiquidity / 10 ** tokenDecimals
    : totalLiquidity;

  const { data: tokenTotalCap } = useQuery(
    ['tokenTotalCap', selectedTokenAddress],
    () => getTokenTotalCap(selectedTokenAddress),
    {
      // Execute only when accounts are available.
      enabled: !!selectedTokenAddress,
    },
  );
  const formattedTokenTotalCap = tokenDecimals
    ? tokenTotalCap / 10 ** tokenDecimals
    : tokenTotalCap;

  const { data: tokenWalletCap } = useQuery(
    ['tokenWalletCap', selectedTokenAddress],
    () => getTokenWalletCap(selectedTokenAddress),
    {
      // Execute only when accounts are available.
      enabled: !!selectedTokenAddress,
    },
  );

  // const { data: totalLiquidityByLP } = useQuery(
  //   ['totalLiquidityByLP', selectedTokenAddress],
  //   () => getTotalLiquidityByLP(selectedTokenAddress),
  //   {
  //     // Execute only when selectedTokenAddress is available.
  //     enabled: !!selectedTokenAddress,
  //   },
  // );

  // if (tokenWalletCap && totalLiquidityByLP) {
  //   console.log(tokenWalletCap.toString(), totalLiquidityByLP.toString());
  // }

  async function handleNetworkChange(selectedNetwork: Option) {
    const network = chainsList.find(
      chain => chain.chainId === selectedNetwork.id,
    );
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

  function handleSliderChange(value: number) {
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

  function handleConfirmSupplyClick() {
    if (selectedTokenAddress && liquidityAmount && tokenDecimals) {
      addTokenLiquidity(
        selectedTokenAddress,
        ethers.utils.parseUnits(liquidityAmount, tokenDecimals),
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

        <h2 className="text-xl text-hyphen-purple">Add Liquidity</h2>

        <div className="absolute right-0 flex">
          <button className="mr-4 text-xs text-hyphen-purple">Clear All</button>
          <button className="flex items-center rounded text-hyphen-gray-400">
            <HiAdjustments className="h-4 w-auto rotate-90" />
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
                setWalletBalance(undefined);
                setSelectedToken(tokenOption);
                setSelectedTokenAddress(undefined);
                setIsSelectedTokenApproved(undefined);
              }}
              label={'asset'}
            />
            <Select
              options={networkOptions}
              selected={selectedNetwork}
              setSelected={networkOption => handleNetworkChange(networkOption)}
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
            disabled={!totalLiquidity}
          />
          <StepSlider dots onChange={handleSliderChange} step={25} />
          <button
            className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
            disabled={
              isSelectedTokenApproved || isSelectedTokenApproved === undefined
            }
          >
            {isSelectedTokenApproved === undefined
              ? `Loading Token Approval`
              : isSelectedTokenApproved
              ? `${selectedToken?.name} Approved`
              : `Approve ${selectedToken?.name}`}
          </button>
          <button
            className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-hyphen-gray-300"
            onClick={handleConfirmSupplyClick}
            disabled={liquidityAmount === '' || !isSelectedTokenApproved}
          >
            Confirm Supply
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
                {formattedTotalLiquidity} ETH / {formattedTokenTotalCap} ETH
              </span>
            </div>
          </div>

          <LiquidityInfo />
        </div>
      </section>
    </article>
  );
}

export default AddLiquidity;
