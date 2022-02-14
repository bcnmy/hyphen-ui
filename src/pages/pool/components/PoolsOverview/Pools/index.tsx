import PoolOverview from './PoolOverview';

function Pools() {
  return (
    <article className="rounded-10 bg-white pt-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <h2 className="text-xl text-hyphen-purple">Pools</h2>
      </header>

      <section className="grid grid-cols-1 gap-1">
        <PoolOverview
          apy={97.22}
          chainId={4}
          currentLiquidity={19.8}
          feeApy={4.04}
          rewardApy={95.18}
          tokenSymbol="ETH"
          totalLiquidity={100}
        />
        <PoolOverview
          apy={97.22}
          chainId={4}
          currentLiquidity={19.8}
          feeApy={4.04}
          rewardApy={95.18}
          tokenSymbol="USDT"
          totalLiquidity={100}
        />
        <PoolOverview
          apy={97.22}
          chainId={80001}
          currentLiquidity={19.8}
          feeApy={4.04}
          rewardApy={95.18}
          tokenSymbol="USDC"
          totalLiquidity={100}
        />
      </section>
    </article>
  );
}

export default Pools;
