import { useWalletProvider } from "context/WalletProvider";
import { HiOutlineArrowSmRight } from "react-icons/hi";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <header className="bg-hyphen-purple relative flex w-full items-center justify-center border-b border-black border-opacity-20 bg-opacity-10 text-white shadow-sm backdrop-blur-sm">
      <a href="/" className="absolute left-6">
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
          className="h-8 w-auto"
          alt="Hyphen Logo"
        />
      </a>
      <nav className="flex gap-7 text-white">
        <a
          target="_blank"
          href="https://hyphen-info.biconomy.io/"
          rel="noreferrer"
          className="relative flex items-center text-white"
        >
          Stats
          <HiOutlineArrowSmRight className="absolute top-[2px] right-[-12px] h-3 w-3 -rotate-45" />
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
