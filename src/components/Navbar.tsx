import { Link, NavLink, Route, useSearchParams } from "react-router-dom";
import { useWalletProvider } from "context/WalletProvider";
import { HiOutlineArrowSmRight } from "react-icons/hi";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <header className="flex items-center justify-between w-full px-6 text-white border-b border-black shadow-sm bg-hyphen-purple bg-opacity-10 backdrop-blur-sm border-opacity-20">
      <Link to="/bridge">
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
          className="w-auto h-8 mr-8"
          alt="Hyphen Logo"
        />
      </Link>
      <nav className="flex text-white gap-7">
        <NavLink to="/bridge">
          {({ isActive }) => (
            <span
              className={
                isActive
                  ? "relative"
                  : "relative text-gray-400 hover:text-white"
              }
            >
              Bridge
              <span
                className={
                  isActive
                    ? "absolute block h-[5px] bg-white -inset-1 top-[34px] rounded-t-full"
                    : "hidden"
                }
                aria-hidden="true"
              ></span>
            </span>
          )}
        </NavLink>
        <NavLink
          to="/pool"
          className={({ isActive }) => (isActive ? "relative" : "relative")}
        >
          {({ isActive }) => (
            <span
              className={
                isActive
                  ? "relative"
                  : "relative text-gray-400 hover:text-white"
              }
            >
              Pool
              <span
                className={
                  isActive
                    ? "absolute block h-[5px] bg-white -inset-1 top-[34px] rounded-t-full"
                    : "hidden"
                }
                aria-hidden="true"
              ></span>
            </span>
          )}
        </NavLink>
        <a
          target="_blank"
          href="https://hyphen-info.biconomy.io/"
          rel="noreferrer"
          className="relative flex items-center text-gray-400 hover:text-white"
        >
          Stats
          <HiOutlineArrowSmRight className="absolute w-3 h-3 -rotate-45 top-[2px] right-[-12px]" />
        </a>
      </nav>
      <button
        className="px-4 py-1 bg-white bg-opacity-10 rounded-xl text-white font-mono border border-opacity-10 border-white font-base relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20"
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
