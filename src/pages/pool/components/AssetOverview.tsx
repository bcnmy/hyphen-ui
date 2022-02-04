interface IAssetOverview {
  apy?: number;
  assetValue?: number;
  assetSymbol?: string;
  poolShare?: number;
  unclaimedFees?: number;
}

function AssetOverview({
  apy,
  assetValue,
  assetSymbol,
  poolShare,
  unclaimedFees,
}: IAssetOverview) {
  return (
    <section className="px-10 py-6 h-[150px] border rounded-[30px]">
      <div>
        <span className="text-[10px] uppercase text-hyphen-gray-200 mb-2.5">
          Asset supplied
        </span>
      </div>
    </section>
  );
}

export default AssetOverview;
