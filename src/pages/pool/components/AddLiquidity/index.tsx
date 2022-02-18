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
import { ethers } from 'ethers';
import erc20ABI from 'contracts/erc20.abi.json';
import Skeleton from 'react-loading-skeleton';
import whitelistPeriodManagerABI from 'contracts/WhitelistPeriodManager.abi.json';
import { useQuery } from 'react-query';

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
  const { chainsList } = useChains()!;
  const { tokensList } = useToken()!;
  const whitelistPeriodManagerContract = useMemo(() => {
    return new ethers.Contract(
      '0xE6A9E731Bf796a9368a61d125092D3E8871ebace',
      whitelistPeriodManagerABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const [selectedToken, setSelectedToken] = useState<Option | undefined>();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<
    string | undefined
  >();
  const [selectedNetwork, setSelectedNetwork] = useState<Option | undefined>();
  const [balance, setBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
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

  const { data: tokenWalletCap } = useQuery(
    ['tokenWalletCap', selectedTokenAddress],
    () => getTokenWalletCap(selectedTokenAddress),
    {
      // Execute only when accounts are available.
      enabled: !!selectedTokenAddress,
    },
  );

  if (tokenWalletCap) {
    console.log(tokenWalletCap.toNumber());
  }

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
        const { displayBalance, userRawBalance } = await getTokenBalance(
          accounts[0],
          chain,
          chainRpcProvider,
          token,
          tokenContract,
        );
        console.log(userRawBalance.toString());
        setSelectedTokenAddress(token[currentChainId].address);
        setBalance(displayBalance);
      }
    }

    setSelectedTokenAddress(undefined);
    setBalance(undefined);
    handleTokenChange();
  }, [accounts, chainsList, currentChainId, selectedToken, tokensList]);

  function getTokenWalletCap(tokenAddress: string | undefined) {
    return whitelistPeriodManagerContract.perTokenWalletCap(tokenAddress);
  }

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

  function handleLiquidityAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityAmount);

    if (isInputValid) {
      setLiquidityAmount(newLiquidityAmount);
    }
  }

  function handleSliderChange(value: number) {
    if (value === 0) {
      setLiquidityAmount('');
    } else if (balance && parseFloat(balance) > 0) {
      const newLiquidityAmount = (
        Math.trunc(parseFloat(balance) * (value / 100) * 1000) / 1000
      ).toString();
      setLiquidityAmount(newLiquidityAmount);
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
              setSelected={token => setSelectedToken(token)}
              label={'asset'}
            />
            <Select
              options={networkOptions}
              selected={selectedNetwork}
              setSelected={network => handleNetworkChange(network)}
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
              {balance ? (
                balance
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
            type="text"
            inputMode="decimal"
            className="mt-2 mb-6 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
            value={liquidityAmount}
            onChange={handleLiquidityAmountChange}
          />
          <StepSlider dots onChange={handleSliderChange} step={25} />
          <button className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-gray-100 font-semibold text-hyphen-gray-300">
            ETH Approved
          </button>
          <button className="h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white">
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
                0.02%
              </div>
            </div>
          </div>

          <div className="mb-16">
            <ProgressBar currentProgress={25} />
            <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
              <span>Pool cap</span>
              <span>19.8 ETH / 100 ETH</span>
            </div>
          </div>

          <LiquidityInfo />
        </div>
      </section>
    </article>
  );
}

export default AddLiquidity;
