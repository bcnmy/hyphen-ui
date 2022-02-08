import ProgressBar from 'components/ProgressBar';
import { chains } from 'config/chains';
import tokens from 'config/tokens';
import CustomTooltip from 'components/CustomTooltip';
import { HiInformationCircle } from 'react-icons/hi';

interface IPoolOverview {
  apy: number;
  chainId: number;
  currentLiquidity: number;
  feeApy: number;
  rewardApy: number;
  tokenSymbol: string;
  totalLiquidity: number;
}

function PoolOverview({
  apy,
  chainId,
  currentLiquidity,
  feeApy,
  rewardApy,
  tokenSymbol,
  totalLiquidity,
}: IPoolOverview) {
  if (!chainId) return null;

  const token = tokens.find((token) => token.symbol === tokenSymbol)!;
  const {
    image: tokenImage,
    [chainId]: { chainColor },
  } = token;
  const chain = chains.find((chain) => chain.chainId === chainId)!;
  const { name: chainName } = chain;

  return (
    <section
      className="relative flex h-[150px] w-full cursor-pointer items-center justify-center text-hyphen-gray-200"
      style={{ backgroundColor: chainColor }}
    >
      <div className="absolute left-[50px] flex items-center">
        <img src={tokenImage} alt={tokenSymbol} className="mr-2 h-8 w-8" />
        <div className="flex flex-col">
          <span className="font-mono text-2xl">{tokenSymbol}</span>
          <span className="text-[10px] font-bold uppercase text-hyphen-gray-100">
            {chainName}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="font-mono text-2xl">{apy}%</span>
          <HiInformationCircle
            className="ml-1 h-4 w-4 text-gray-500"
            data-tip
            data-for="apy"
          />
          <CustomTooltip id="apy">
            <p>Reward APY: {rewardApy}%</p>
            <p>Fee APY: {feeApy}</p>
          </CustomTooltip>
        </div>
        <span className="text-[10px] font-bold uppercase text-hyphen-gray-100">
          Annualized
        </span>
      </div>

      <div className="absolute right-[50px] flex h-[47px] w-[250px] flex-col justify-end">
        <ProgressBar currentProgress={25} />
        <div className="mt-1 flex justify-between text-[10px] font-bold uppercase text-hyphen-gray-100">
          <span>Pool cap</span>
          <span>
            {currentLiquidity} {tokenSymbol} / {totalLiquidity} {tokenSymbol}
          </span>
        </div>
      </div>
    </section>
  );
}

export default PoolOverview;
