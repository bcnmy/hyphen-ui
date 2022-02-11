import tokens from 'config/tokens';
import { useNavigate } from 'react-router-dom';

interface IAssetOverview {
  apy: number;
  chainId: number;
  poolShare: number;
  redirectToManageLiquidity?: boolean | false;
  tokenSupplied: number;
  tokenSymbol: string;
  unclaimedFees: number;
}

function AssetOverview({
  apy,
  chainId,
  poolShare,
  redirectToManageLiquidity,
  tokenSupplied,
  tokenSymbol,
  unclaimedFees,
}: IAssetOverview) {
  const navigate = useNavigate();
  const token = tokens.find((token) => token.symbol === tokenSymbol)!;
  const {
    image: tokenImage,
    [chainId]: { chainColor },
  } = token;

  function handleAssetOverviewClick() {
    if (redirectToManageLiquidity) {
      navigate('manage-liquidity');
    }
  }

  return (
    <section
      className="flex h-[150px] items-center justify-between rounded-[30px] border px-10 py-6 text-hyphen-gray-400"
      onClick={handleAssetOverviewClick}
      style={{ backgroundColor: chainColor }}
    >
      <div className="flex flex-col">
        <span className="mb-2.5 text-[10px] font-bold uppercase">
          Asset supplied
        </span>
        <div className="mb-5 flex items-center">
          <img src={tokenImage} alt={tokenSymbol} className="mr-2 h-5 w-5" />
          <span className="font-mono text-2xl ">
            {tokenSupplied} {tokenSymbol}
          </span>
        </div>
        <span className="font-mono text-xs">Pool Share: {poolShare}%</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="mb-2.5 text-[10px] font-bold uppercase ">APY</span>
        <span className="mb-5 font-mono text-2xl">{apy}%</span>
        <span className="font-mono text-xs">
          Unclaimed Fees: ~ ${unclaimedFees}
        </span>
      </div>
    </section>
  );
}

export default AssetOverview;
