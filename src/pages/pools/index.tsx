import { useWalletProvider } from 'context/WalletProvider';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function Pools() {
  const { isLoggedIn, connect } = useWalletProvider()!;

  useEffect(() => {
    (async () => {
      await connect().catch(e => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, connect]);

  return (
    <main className="mx-auto w-full max-w-5xl md:w-256">
      {/* <Outlet /> */}
    </main>
  );
}

export default Pools;
