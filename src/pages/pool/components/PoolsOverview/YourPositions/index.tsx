import AssetOverview from "../../AssetOverview";

function YourPositions() {
  return (
    <article className="bg-white rounded-[40px] p-2.5">
      <header className="relative flex items-center justify-center px-10 my-6">
        <div className="absolute left-10">
          <button className="text-xs text-hyphen-purple mr-7">
            Active Position (2)
          </button>
          <button className="text-xs text-hyphen-gray-100">
            Show Closed Positions
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Your Positions</h2>

        <button className="absolute right-10 text-xs text-white bg-hyphen-purple px-3.5 h-9 w-28 rounded-xl">
          + Add Liquidity
        </button>
      </header>

      <section className="grid grid-cols-2 gap-[10px]">
        <AssetOverview />
        <AssetOverview />
        <AssetOverview />
        <AssetOverview />
      </section>
    </article>
  );
}

export default YourPositions;
