import { Link } from 'react-router-dom';
import AssetOverview from '../../AssetOverview';

function YourPositions() {
  return (
    <article className="mb-2.5 rounded-[40px] bg-white p-2.5">
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

        <Link
          to="add-liquidity"
          className="absolute right-10 flex h-9 w-28 items-center justify-center rounded-xl bg-hyphen-purple text-xs text-white"
        >
          + Add Liquidity
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-[10px]">
        <AssetOverview
          apy={81.19}
          tokenSymbol="ETH"
          tokenSupplied={59.64}
          chainId={1}
          poolShare={0.02}
          unclaimedFees={651}
        />
        <AssetOverview
          apy={91.91}
          tokenSymbol="USDC"
          tokenSupplied={459.64}
          chainId={43114}
          poolShare={0.03}
          unclaimedFees={154}
        />
        <AssetOverview
          apy={80.5}
          tokenSymbol="USDT"
          tokenSupplied={1059.64}
          chainId={1}
          poolShare={0.02}
          unclaimedFees={157}
        />
        <AssetOverview
          apy={71.55}
          tokenSymbol="BICO"
          tokenSupplied={9999.64}
          chainId={137}
          poolShare={0.025}
          unclaimedFees={1547}
        />
      </section>
    </article>
  );
}

export default YourPositions;
