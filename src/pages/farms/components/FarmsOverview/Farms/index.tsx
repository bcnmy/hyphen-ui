import FarmOverview from './FarmOverview';
import { HiOutlineXCircle } from 'react-icons/hi';
import { useChains } from 'context/Chains';
import { useToken } from 'context/Token';

function Farms() {
  const { networks } = useChains()!;
  const { tokens, isTokensLoading, isTokensError } = useToken()!;

  if (isTokensError) {
    return (
      <article className="rounded-10 bg-white p-2.5">
        <section className="my-16 flex items-center justify-center px-[1.875rem]">
          <HiOutlineXCircle className="mr-4 min-h-[24px] min-w-[24px] text-red-400" />
          <p className="text-hyphen-gray-400">
            Something went wrong while we were fetching the list of farms,
            please try again later.
          </p>
        </section>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-10 bg-white pt-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <h2 className="text-sm text-hyphen-purple xl:text-xl">All Farms</h2>
      </header>

      {!isTokensLoading ? (
        <section className="grid grid-cols-1 gap-1">
          <div className="mb-1 mt-2 grid grid-cols-2 px-[2.375rem] xl:grid-cols-3 xl:px-[3.125rem]">
            <h3 className="text-xxxs font-semibold uppercase text-hyphen-gray-400 xl:text-xxs">
              Asset
            </h3>
            <h3 className="justify-self-end text-xxxs font-semibold uppercase text-hyphen-gray-400 xl:justify-self-center xl:text-xxs">
              Reward APY
            </h3>
            <h3 className="hidden justify-self-end text-xxxs font-semibold uppercase text-hyphen-gray-400 xl:flex xl:text-xxs">
              Daily Rewards
            </h3>
          </div>

          {networks && tokens
            ? networks.map(networkObj => {
                return Object.keys(tokens).map((tokenSymbol: any) => {
                  const token = tokens[tokenSymbol];
                  const tokenObj = token[networkObj.chainId]?.isSupported
                    ? {
                        coinGeckoId: token.coinGeckoId,
                        tokenImage: token.image,
                        ...token[networkObj.chainId],
                      }
                    : null;

                  return tokenObj ? (
                    <FarmOverview
                      key={`farm-${networkObj.name}-${tokenSymbol}`}
                      chain={networkObj}
                      token={tokenObj}
                    />
                  ) : null;
                });
              })
            : null}
        </section>
      ) : (
        <section className="mt-16 mb-24 flex items-center justify-center px-[1.875rem]">
          <svg
            role="status"
            className="mr-4 h-6 w-6 animate-spin fill-hyphen-purple text-gray-200"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <p className="text-hyphen-gray-400">Getting Hyphen farms.</p>
        </section>
      )}
    </article>
  );
}

export default Farms;
