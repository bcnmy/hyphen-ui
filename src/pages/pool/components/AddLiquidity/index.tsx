import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiAdjustments, HiArrowSmLeft } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import ProgressBar from 'components/ProgressBar';
import Select, { Option } from 'components/Select';
import { chains } from 'config/chains';
import { tokens } from 'config/tokens';
import LiquidityInfo from '../LiquidityInfo';
import StepSlider from '../StepSlider';

interface IAddLiquidity {
  apy: number;
  currentLiquidity: number;
  network: string;
  tokenSymbol: string;
  totalLiquidity: number;
}

function AddLiquidity() {
  const navigate = useNavigate();
  const tokenOptions = tokens.map((token) => {
    return {
      id: token.symbol,
      name: token.symbol,
      image: token.image,
    };
  });
  const [selectedToken, setSelectedToken] = useState<Option>();
  const networkOptions = chains.map((chain) => {
    return {
      id: chain.chainId,
      name: chain.name,
    };
  });
  const [selectedNetwork, setSelectedNetwork] = useState<Option>();

  return (
    <article className="my-24 rounded-[40px] bg-white p-[50px] pt-2.5">
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
        <div className="h-[25rem] max-h-[25rem] border-r pr-[50px]">
          <div className="mb-6 grid grid-cols-2 gap-2.5">
            <Select
              options={tokenOptions}
              selected={tokenOptions[0]}
              setSelected={(token) => setSelectedToken(token)}
              label={'asset'}
            />
            <Select
              options={networkOptions}
              selected={networkOptions[0]}
              setSelected={(network) => setSelectedNetwork(network)}
              label={'network'}
            />
          </div>
          <label
            htmlFor="liquidityAmount"
            className="flex justify-between px-5 text-[10px] font-bold uppercase"
          >
            <span className="text-hyphen-gray-400">Input</span>
            <span className="text-hyphen-gray-300">
              Your address limit: Ξ80
            </span>
          </label>
          <input
            id="liquidityAmount"
            placeholder="0.000"
            type="text"
            className="mt-2 mb-6 h-[60px] w-full rounded-[10px] border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
          />
          <StepSlider dots step={25} />
          <button className="mt-9 mb-2.5 h-[60px] w-full rounded-[10px] bg-gray-100 font-semibold text-hyphen-gray-300">
            ETH Approved
          </button>
          <button className="h-[60px] w-full rounded-[10px] bg-hyphen-purple font-semibold text-white">
            Confirm Supply
          </button>
        </div>
        <div className="h-[25rem] max-h-[25rem] pl-[50px]">
          <div className="mb-14 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <span className="pl-5 text-[10px] font-bold uppercase text-hyphen-gray-400">
                APY
              </span>
              <div className="mt-2 flex h-[60px] items-center rounded-[10px] bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                81.19%
              </div>
            </div>
            <div className="flex flex-col">
              <span className="pl-5 text-[10px] font-bold uppercase text-hyphen-gray-400">
                Your pool share
              </span>
              <div className="mt-2 flex h-[60px] items-center rounded-[10px] bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-400">
                0.02%
              </div>
            </div>
          </div>

          <div className="mb-16">
            <ProgressBar currentProgress={25} />
            <div className="mt-1 flex justify-between text-[10px] font-bold uppercase text-hyphen-gray-300">
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
