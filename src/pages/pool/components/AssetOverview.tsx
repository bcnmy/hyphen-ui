import tokens from 'config/tokens';

interface IAssetOverview {
  apy: number;
  tokenSymbol: string;
  tokenSupplied: number;
  chainId: number;
  poolShare: number;
  unclaimedFees: number;
}

function AssetOverview({
  apy,
  tokenSymbol,
  tokenSupplied,
  chainId,
  poolShare,
  unclaimedFees,
}: IAssetOverview) {
  if (!chainId) return null;

  const token = tokens.find((token) => token.symbol === tokenSymbol)!;
  const {
    image: tokenImage,
    [chainId]: { chainColor },
  } = token;

  return (
    <section
      className="flex h-[150px] items-center justify-between rounded-[30px] border px-10 py-6 text-hyphen-gray-300"
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
