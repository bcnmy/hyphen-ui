import { useWalletProvider } from "context/WalletProvider";
import { HiOutlineArrowSmRight } from "react-icons/hi";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts, connect, isLoggedIn } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <div className="sticky top-0 flex py-2 text-white border-b border-black shadow-sm bg-hyphen-purple bg-opacity-10 backdrop-blur-sm border-opacity-20">
      <div className="flex items-center justify-between flex-grow max-w-5xl mx-auto">
        <div className="flex flex-grow mx-4 font-semibold tracking-wide ">
          <a
            target="_blank"
            href="https://hyphen-info.biconomy.io/"
            rel="noreferrer"
            className="flex items-center text-white"
          >
            Analytics <HiOutlineArrowSmRight className="w-5 h-5 -rotate-45" />
          </a>
          <button
            className="px-4 py-2 bg-white bg-opacity-10 rounded-full font-mono text-white text-opacity-75 border border-opacity-10 border-white ml-auto font-normal relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20"
            onClick={isLoggedIn ? showUserInfoModal : connect}
          >
            {isLoggedIn
              ? `${userAddress?.slice(0, 6)}...${userAddress?.slice(-6)}`
              : "Connect Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
