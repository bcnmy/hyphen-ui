import AssetOverview from '../../AssetOverview';

function YourPositions() {
  return (
    <article className="rounded-[40px] bg-white p-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <div className="absolute left-10">
          <button className="mr-7 text-xs text-hyphen-purple">
            Active Position (2)
          </button>
          <button className="text-xs text-hyphen-gray-100">
            Show Closed Positions
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Your Positions</h2>

        <button className="absolute right-10 h-9 w-28 rounded-xl bg-hyphen-purple text-xs text-white">
          + Add Liquidity
        </button>
      </header>

      <section className="grid grid-cols-2 gap-[10px]">
        <AssetOverview
          apy={81.19}
          assetSymbol="ETH"
          assetValue={459.64}
          poolShare={0.02}
          unclaimedFees={64}
        />
        <AssetOverview
          apy={81.19}
          assetSymbol="ETH"
          assetValue={459.64}
          poolShare={0.02}
          unclaimedFees={64}
        />
        <AssetOverview
          apy={81.19}
          assetSymbol="ETH"
          assetValue={459.64}
          poolShare={0.02}
          unclaimedFees={64}
        />
        <AssetOverview
          apy={81.19}
          assetSymbol="ETH"
          assetValue={459.64}
          poolShare={0.02}
          unclaimedFees={64}
        />
      </section>
    </article>
  );
}

export default YourPositions;
