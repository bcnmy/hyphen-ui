import { useWalletProvider } from "context/WalletProvider";
import { useState } from "react";
import { HiOutlineExternalLink } from "react-icons/hi";

interface INavbarProps {
  showUserInfoModal: () => void;
}

function Navbar({ showUserInfoModal }: INavbarProps) {
  const { accounts } = useWalletProvider()!;
  const userAddress = accounts?.[0];

  return (
    <div className="sticky top-0 flex py-2 text-white border-b border-black shadow-sm bg-hyphen-purple bg-opacity-10 backdrop-blur-sm border-opacity-20">
      <div className="flex items-center justify-between flex-grow max-w-5xl mx-auto">
        <div className="flex flex-grow mx-4 font-semibold tracking-wide ">
          <span className="flex items-center gap-2 text-white text-opacity-90">
            Analytics <HiOutlineExternalLink />
          </span>
          <button
            className="px-4 py-2 bg-white bg-opacity-10 shadow-md rounded-full font-mono text-white text-opacity-75 border border-opacity-10 border-white ml-auto font-normal relative backdrop-blur-md cursor-pointer hover:bg-opacity-[0.15] hover:text-opacity-90 hover:border-opacity-20 hover:shadow-lg transition"
            onClick={showUserInfoModal}
          >
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
