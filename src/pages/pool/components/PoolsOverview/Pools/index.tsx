import { chains } from 'config/chains';
import tokens from 'config/tokens';
import { useQuery } from 'react-query';
import PoolOverview from './PoolOverview';

function Pools() {
  const { data } = useQuery(
    'tokens',
    () =>
      fetch('http://3.83.11.76:3000/api/v1/configuration/tokens').then(res =>
        res.json(),
      ),
    {
      enabled: !!chains,
    },
  );
  const { message: tokensObject } = data || {};

  return (
    <article className="rounded-10 bg-white pt-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <h2 className="text-xl text-hyphen-purple">Pools</h2>
      </header>

      <section className="grid grid-cols-1 gap-1">
        {chains && tokensObject
          ? chains.map(chainObj => {
              return Object.keys(tokensObject).map((tokenSymbol: any) => {
                const token = tokens.find(
                  tokenObj => tokenObj.symbol === tokenSymbol,
                )!;
                const tokenObj = token[chainObj.chainId]
                  ? {
                      tokenImage: token.image,
                      ...token[chainObj.chainId],
                    }
                  : null;

                return tokenObj ? (
                  <PoolOverview
                    apy={83}
                    chain={chainObj}
                    feeApy={20}
                    rewardApy={63}
                    token={tokenObj}
                    totalLiquidity={200000}
                    key={`${chainObj.chainId}-${tokenSymbol}`}
                  />
                ) : null;
              });
            })
          : null}
      </section>
    </article>
  );
}

export default Pools;
