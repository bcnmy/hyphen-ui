import { useWalletProvider } from 'context/WalletProvider';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function Farms() {
  const { isLoggedIn, connect } = useWalletProvider()!;

  useEffect(() => {
    (async () => {
      connect && connect();
    })();
  }, [isLoggedIn, connect]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 xl:w-256 xl:px-0">
      <Outlet />
    </main>
  );
}

export default Farms;
