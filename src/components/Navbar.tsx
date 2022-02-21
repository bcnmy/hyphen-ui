import { useWalletProvider } from "context/WalletProvider";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-center bg-black text-white">
      <a href="/" className="absolute left-6">
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
          className="h-8 w-auto"
          alt="Hyphen Logo"
        />
      </a>
      <nav className="flex h-full gap-7 text-white">
        <a
          target="_blank"
          href="https://hyphen-info.biconomy.io/"
          rel="noreferrer"
          className="group relative flex items-center text-sm font-medium uppercase text-white"
        >
          Stats
          <span
            className="absolute -inset-1 top-[58px] hidden h-[5px] rounded-t-full bg-white group-hover:block"
            aria-hidden="true"
          ></span>
        </a>
        <a
          target="_blank"
          href="https://docs.biconomy.io/products/hyphen-instant-cross-chain-transfers"
          rel="noreferrer"
          className="group relative flex items-center text-sm font-medium uppercase text-white"
        >
          Docs
          <span
            className="absolute -inset-1 top-[58px] hidden h-[5px] rounded-t-full bg-white group-hover:block"
            aria-hidden="true"
          ></span>
        </a>
      </nav>
      <button
        className="font-base absolute right-6 cursor-pointer rounded-xl border border-white border-opacity-10 bg-white bg-opacity-10 px-4 py-1 font-mono text-white backdrop-blur-md hover:border-opacity-20 hover:bg-opacity-[0.15] hover:text-opacity-90"
        onClick={isLoggedIn ? showUserInfoModal : connect}
      >
        {isLoggedIn
          ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
          : "Connect Wallet"}
      </button>
    </header>
  );
}

export default Navbar;
