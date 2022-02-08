import { useWalletProvider } from 'context/WalletProvider';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

function Pool() {
  const { isLoggedIn, connect } = useWalletProvider()!;

  useEffect(() => {
    (async () => {
      console.log('Hello World!');
      await connect().catch((e) => {
        console.error(e);
      });
    })();
  }, [isLoggedIn, connect]);

  return (
    <main className="mx-auto w-[64rem] max-w-5xl">
      <Outlet />
    </main>
  );
}

export default Pool;
