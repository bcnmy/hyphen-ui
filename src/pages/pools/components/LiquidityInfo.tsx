import hyphenStatsIcon from '../../../assets/images/hyphen-stats.svg';
import liquidityGuideIcon from '../../../assets/images/liquidity-guide.svg';

function LiquidityInfo() {
  return (
    <section className="grid grid-cols-2 gap-2.5">
      <div>
        <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
          Top pools
        </span>
        <a
          className="mt-2 flex h-32.5 flex-col items-start justify-between rounded-lg border border-dashed p-5 text-hyphen-purple hover:bg-gray-50"
          href="https://hyphen-stats.biconomy.io/"
          target="_blank"
          rel="noreferrer"
        >
          Explore Hyphen Stats.
          <img src={hyphenStatsIcon} alt="Hyphen info" className="mt-1.5" />
        </a>
      </div>
      <div>
        <span className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400">
          Learn more
        </span>
        <a
          className="mt-2 flex h-32.5 flex-col items-start justify-between rounded-lg border border-dashed p-5 text-hyphen-purple hover:bg-gray-50"
          href="https://medium.com/biconomy/hyphen-2-0-liquidity-providers-f6d00560851c"
          target="_blank"
          rel="noreferrer"
        >
          Check out our Liquidity Pool guide.
          <img
            src={liquidityGuideIcon}
            alt="Liquidity guide"
            className="mt-1.5"
          />
        </a>
      </div>
    </section>
  );
}

export default LiquidityInfo;
