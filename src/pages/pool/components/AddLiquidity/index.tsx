import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import { HiAdjustments, HiArrowSmLeft } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import ProgressBar from 'components/ProgressBar';
import Select, { Option } from 'components/Select';
import { chains } from 'config/chains';
import { tokens } from 'config/tokens';
import LiquidityInfo from '../LiquidityInfo';
import 'rc-slider/assets/index.css';

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
            className="flex items-center rounded text-hyphen-gray-300"
            onClick={() => navigate(-1)}
          >
            <HiArrowSmLeft className="h-5 w-auto" />
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Add Liquidity</h2>

        <div className="absolute right-0 flex">
          <button className="mr-4 text-xs text-hyphen-purple">Clear All</button>
          <button className="flex items-center rounded text-hyphen-gray-300">
            <HiAdjustments className="h-4 w-auto rotate-90" />
          </button>
        </div>
      </header>

      <section className="grid h-[400px] grid-cols-2">
        <div className="border-r pr-[50px]">
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
            className="pl-5 text-[10px] font-bold uppercase text-hyphen-gray-300"
          >
            Input
          </label>
          <input
            type="text"
            className="mt-2 mb-6 h-[60px] w-full rounded-[10px] border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-300 focus:outline-none"
          />
          <Slider className="mb-9" />
          <button className="mb-2.5 h-[60px] w-full rounded-[10px] bg-gray-100 font-semibold text-hyphen-gray-200">
            ETH Approved
          </button>
          <button className="h-[60px] w-full rounded-[10px] bg-hyphen-purple font-semibold text-white">
            Confirm Supply
          </button>
        </div>
        <div className="pl-[50px]">
          <div className="mb-14 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <span className="pl-5 text-[10px] font-bold uppercase text-hyphen-gray-300">
                APY
              </span>
              <div className="mt-2 flex h-[60px] items-center rounded-[10px] bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-300">
                81.19%
              </div>
            </div>
            <div className="flex flex-col">
              <span className="pl-5 text-[10px] font-bold uppercase text-hyphen-gray-300">
                Your pool share
              </span>
              <div className="mt-2 flex h-[60px] items-center rounded-[10px] bg-hyphen-purple bg-opacity-10 px-5 font-mono text-2xl text-hyphen-gray-300">
                0.02%
              </div>
            </div>
          </div>

          <div className="mb-16">
            <ProgressBar currentProgress={25} />
            <div className="mt-1 flex justify-between text-[10px] font-bold uppercase text-hyphen-gray-200">
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
