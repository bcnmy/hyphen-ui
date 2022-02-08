interface IAddLiquidity {
  apy: number;
  currentLiquidity: number;
  network: string;
  tokenSymbol: string;
  totalLiquidity: number;
}

function AddLiquidity() {
  return (
    <article className="rounded-[40px] bg-white p-[50px]">
      <header className="relative my-6 flex items-center justify-center px-10">
        <button className="text-xs text-hyphen-gray-100">
          Show Closed Positions
        </button>

        <h2 className="text-xl text-hyphen-purple">Add Liquidity</h2>

        <div className="absolute right-0">
          <button className="absolute right-10 h-9 w-28 rounded-xl bg-hyphen-purple text-xs text-white">
            + Add Liquidity
          </button>
        </div>
      </header>
    </article>
  );
}

export default AddLiquidity;
