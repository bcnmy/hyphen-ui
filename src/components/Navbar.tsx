import { useWalletProvider } from "context/WalletProvider";
import { HiOutlineArrowSmRight } from "react-icons/hi";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <div className="flex items-center justify-between w-full px-6 text-white border-b border-black shadow-sm bg-hyphen-purple bg-opacity-10 backdrop-blur-sm border-opacity-20">
      <div className="flex">
        <img
          src={`${process.env.PUBLIC_URL}/hyphen-logo.svg`}
          className="w-auto h-8 mr-8"
          alt="Hyphen Logo"
        />
        <a
          target="_blank"
          href="https://hyphen-info.biconomy.io/"
          rel="noreferrer"
          className="flex items-center text-white"
        >
          Analytics <HiOutlineArrowSmRight className="w-5 h-5 -rotate-45" />
        </a>
      </div>
      <button
        className="px-4 py-1 bg-white bg-opacity-10 rounded-xl text-white font-mono border border-opacity-10 border-white font-base relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20"
        onClick={isLoggedIn ? showUserInfoModal : connect}
      >
        {isLoggedIn
          ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
          : "Connect Wallet"}
      </button>
    </div>
  );
}

export default Navbar;
