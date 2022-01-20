import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Dialog } from "@headlessui/react";
import { useWalletProvider } from "context/WalletProvider";
import { IoMdClose } from "react-icons/io";
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
} from "react-icons/hi";
import Modal from "../../../../components/Modal";
import { getProviderInfo } from "web3modal";
import { useChains } from "context/Chains";

export interface IUserInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const USER_TRANSACTIONS = gql`
  query USER_TRANSACTIONS($address: String!) {
    fundsDepositeds(
      first: 5
      orderBy: timestamp
      orderDirection: desc
      where: { from: $address }
    ) {
      id
      from
      receiver
      tokenAddress
      amount
      toChainId
      timestamp
    }
  }
`;

function UserInfoModal({ isVisible, onClose }: IUserInfoModalProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const { accounts, disconnect, rawEthereumProvider } = useWalletProvider()!;
  const { fromChain } = useChains()!;
  const userAddress = accounts?.[0];
  const { loading, error, data } = useQuery(USER_TRANSACTIONS, {
    skip: !isVisible,
    variables: { address: userAddress },
  });
  const { name: providerName } = getProviderInfo(rawEthereumProvider);

  // console.log({ loading, error, data });

  function handleWalletDisconnect() {
    disconnect();
    onClose();
  }

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
          <header className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              Connected with {providerName}
            </p>
            <button
              className="text-sm font-medium text-red-600"
              onClick={handleWalletDisconnect}
            >
              Disconnect
            </button>
          </header>
          <p className="mb-2 text-2xl text-gray-700">
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
          </p>
          <button className="flex items-center" onClick={handleUserAddressCopy}>
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
            {loading ? "Loading..." : "Recent Transactions"}
          </span>
        </article>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
