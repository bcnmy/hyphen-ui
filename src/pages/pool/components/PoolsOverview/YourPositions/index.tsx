import { useEffect, useMemo, useState } from 'react';
import { useChains } from 'context/Chains';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import AssetOverview from '../../AssetOverview';
import lpTokenABI from 'contracts/LPToken.abi.json';
import { useWalletProvider } from 'context/WalletProvider';

function YourPositions() {
  const { accounts } = useWalletProvider()!;
  const { fromChainRpcUrlProvider } = useChains()!;
  const lpContract = useMemo(() => {
    return new ethers.Contract(
      '0xF9e13773D10C0ec25369CC4C0fAEef05eC00B18b',
      lpTokenABI,
      fromChainRpcUrlProvider,
    );
  }, [fromChainRpcUrlProvider]);
  const [userPositions, setUserPositions] = useState(null);

  useEffect(() => {
    async function getUserPositions(userAddress: string) {
      const userPositions = await lpContract.getAllNftIdsByUser(userAddress);
      setUserPositions(userPositions);
    }

    if (accounts) {
      getUserPositions(accounts[0]);
    }
  }, [accounts, lpContract]);

  return (
    <article className="mb-2.5 rounded-10 bg-white p-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <div className="absolute left-10">
          <button className="mr-7 text-xs text-hyphen-purple">
            Active Position (2)
          </button>
          <button className="text-xs text-hyphen-gray-400">
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

      <section className="grid grid-cols-2 gap-2.5">
        <AssetOverview
          apy={81.19}
          chainId={1}
          poolShare={0.02}
          redirectToManageLiquidity
          tokenSupplied={59.64}
          tokenSymbol="ETH"
          unclaimedFees={651}
        />
        <AssetOverview
          apy={91.91}
          chainId={43114}
          poolShare={0.03}
          redirectToManageLiquidity
          tokenSupplied={459.64}
          tokenSymbol="USDC"
          unclaimedFees={154}
        />
        <AssetOverview
          apy={80.5}
          chainId={1}
          poolShare={0.02}
          redirectToManageLiquidity
          tokenSupplied={1059.64}
          tokenSymbol="USDT"
          unclaimedFees={157}
        />
        <AssetOverview
          apy={71.55}
          chainId={137}
          poolShare={0.025}
          redirectToManageLiquidity
          tokenSupplied={9999.64}
          tokenSymbol="BICO"
          unclaimedFees={1547}
        />
      </section>
    </article>
  );
}

export default YourPositions;
