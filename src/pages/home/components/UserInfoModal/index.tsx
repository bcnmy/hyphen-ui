import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useWalletProvider } from "context/WalletProvider";
import { IoMdClose } from "react-icons/io";
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import Modal from "../../../../components/Modal";
import { getProviderInfo } from "web3modal";

export interface IUserInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

function UserInfoModal({ isVisible, onClose }: IUserInfoModalProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const { accounts, rawEthereumProvider } = useWalletProvider()!;
  const userAddress = accounts?.[0];
  const { name: providerName } = getProviderInfo(rawEthereumProvider);

  function handleUserAddressCopy() {
    navigator.clipboard.writeText(userAddress || "");
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
    }, 1500);
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 bg-white border shadow-lg rounded-3xl border-hyphen-purple-darker/50">
        <div className="flex items-center justify-between p-6">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Account
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="w-auto h-6 text-gray-500" />
          </button>
        </div>

        <article className="p-4 mx-6 mb-6 border border-gray-200 rounded-2xl">
          <header className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              Connected with {providerName}
            </p>
            <button className="text-sm font-medium text-red-600">
              Disconnect
            </button>
          </header>
          <p className="mb-2 text-2xl text-gray-700">
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
          </p>
          <button
            className="flex items-center px-2 py-1 -mx-2 rounded hover:bg-gray-100"
            onClick={handleUserAddressCopy}
          >
            {addressCopied ? (
              <HiOutlineClipboardCheck className="w-auto h-4 mr-1 text-green-400" />
            ) : (
              <HiOutlineClipboardCopy className="w-auto h-4 mr-1 text-gray-500" />
            )}
            <span
              className={`text-sm ${
                addressCopied ? "text-green-400" : "text-gray-500"
              }`}
            >
              {addressCopied ? "Copied!" : "Copy Address"}
            </span>
          </button>
        </article>

        <article className="px-6 py-4 bg-gray-100 rounded-bl-3xl rounded-br-3xl">
          <span className="text-lg text-gray-500">
            Recent transactions will appear here...
          </span>
        </article>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
