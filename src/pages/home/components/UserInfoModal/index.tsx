import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { BigNumber, ethers } from "ethers";
import { Dialog } from "@headlessui/react";
import Skeleton from "react-loading-skeleton";
import { useWalletProvider } from "context/WalletProvider";
import { apolloClients } from "context/GraphQL";
import { IoMdClose } from "react-icons/io";
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineArrowNarrowRight,
  HiOutlineArrowSmRight,
} from "react-icons/hi";
import Modal from "../../../../components/Modal";
import { getProviderInfo } from "web3modal";
import { useChains } from "context/Chains";
import { tokens } from "../../../../config/tokens";
import { ChainConfig } from "../../../../config/chains";

export interface IUserInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export interface ITransaction {
  amount: number;
  from: string;
  id: string;
  receiver: string;
  timestamp: string;
  toChainId: string;
  tokenAddress: string;
  __typename: string;
}

export interface ITransactionDetails {
  amount: string;
  amountReceived: string;
  depositHash: string;
  endTimeStamp: string;
  fromChainId: number;
  fromChainLabel: string;
  lpFee: string;
  receivedTokenAddress: string;
  receivedTokenSymbol: string;
  receiver: string;
  sentTimeStamp: string;
  toChainId: number;
  toChainLabel: string;
  tokenSymbol: string;
  transferHash: string;
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

const FUNDS_TO_USER = gql`
  query FUNDS_TO_USER($depositHash: String!) {
    fundsSentToUsers(where: { depositHash: $depositHash }) {
      id
      depositHash
      tokenAddress
      amount
      transferredAmount
      feeEarned
      timestamp
    }
  }
`;

function UserInfoModal({ isVisible, onClose }: IUserInfoModalProps) {
  const [addressCopied, setAddressCopied] = useState(false);
  const [userTransactions, setUserTransactions] = useState<any>([]);
  const { accounts, disconnect, rawEthereumProvider } = useWalletProvider()!;
  const { chainsList, fromChain } = useChains()!;
  const { name: providerName } = getProviderInfo(rawEthereumProvider);
  const userAddress = accounts?.[0];
  const { loading, error, data } = useQuery(USER_TRANSACTIONS, {
    skip: !isVisible,
    variables: { address: userAddress },
  });

  useEffect(() => {
    function getTokenInfo(
      amount: number,
      tokenAddress: string,
      fromChainId: number
    ): { formattedAmount: string; symbol: string } {
      const tokenInfo = tokens.find((token) => {
        const { address } = token[fromChainId];
        return address.toLowerCase() === tokenAddress.toLowerCase();
      })!;
      const { decimal, symbol } = tokenInfo[fromChainId];
      const formattedAmount = BigNumber.from(amount)
        .div(BigNumber.from(10).pow(decimal))
        .toString();

      return { formattedAmount, symbol };
    }

    async function getTransferInfo(transactionId: string, toChainId: number) {
      const apolloClient = apolloClients[toChainId];
      const { data } = await apolloClient.query({
        query: FUNDS_TO_USER,
        variables: { depositHash: transactionId },
      });
      return data.fundsSentToUsers[0];
    }

    async function getUserTransactions(
      chainsList: ChainConfig[],
      data: { fundsDepositeds: ITransaction[] },
      fromChain: ChainConfig
    ) {
      const { chainId: fromChainId, name: fromChainLabel } = fromChain;
      const { fundsDepositeds } = data;
      let transformedTransactions = [];
      for (const transaction of fundsDepositeds) {
        const {
          id: transactionId,
          amount,
          receiver,
          toChainId: toChainIdAsString,
          tokenAddress: sentTokenAddress,
          timestamp: sentTimeStamp,
        } = transaction;
        const { formattedAmount: sentAmount, symbol: sentTokenSymbol } =
          getTokenInfo(amount, sentTokenAddress, fromChainId);
        const toChainId = Number.parseInt(toChainIdAsString, 10);
        const { name: toChainLabel } = chainsList.find(
          (chain) => chain.chainId === toChainId
        )!;
        const {
          id: transferHash,
          feeEarned,
          tokenAddress: receivedTokenAddress,
          timestamp: receviedTimeStamp,
          transferredAmount,
        } = await getTransferInfo(transactionId, toChainId);
        const { formattedAmount: receivedAmount, symbol: receivedTokenSymbol } =
          getTokenInfo(transferredAmount, receivedTokenAddress, toChainId);
        const { formattedAmount: lpFee } = getTokenInfo(
          feeEarned,
          receivedTokenAddress,
          toChainId
        );

        const transactionDetails = {
          amount: sentAmount,
          amountReceived: receivedAmount,
          depositHash: transactionId,
          endTimeStamp: receviedTimeStamp,
          fromChainLabel,
          fromChainId,
          lpFee,
          receivedTokenAddress,
          receivedTokenSymbol,
          receiver,
          sentTimeStamp,
          toChainId,
          toChainLabel,
          tokenSymbol: sentTokenSymbol,
          transferHash,
        };

        console.log(transactionDetails);

        transformedTransactions.push(transactionDetails);
      }

      setUserTransactions(transformedTransactions);
    }

    if (data && fromChain) {
      getUserTransactions(chainsList, data, fromChain);
    }
  }, [chainsList, data, fromChain]);

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

        <article className="px-6 py-4 bg-gray-50 rounded-bl-3xl rounded-br-3xl">
          <h2 className="mb-4 text-lg text-gray-500">Recent Transactions</h2>
          {loading ? (
            <Skeleton
              baseColor="#615ccd20"
              count={5}
              highlightColor="#615ccd05"
              height={20}
            />
          ) : null}

          {userTransactions.length > 0
            ? userTransactions.map((userTransaction: ITransactionDetails) => {
                const { image, symbol } = tokens.find(
                  (token) => token.symbol === userTransaction.tokenSymbol
                )!;
                const fromChainExplorerUrl = `${
                  chainsList.find(
                    (chain) => chain.chainId === userTransaction.fromChainId
                  )!.explorerUrl
                }/tx/${userTransaction.depositHash}`;
                const toChainExplorerUrl = `${
                  chainsList.find(
                    (chain) => chain.chainId === userTransaction.toChainId
                  )!.explorerUrl
                }/tx/${userTransaction.transferHash}`;

                return (
                  <ul>
                    <li className="flex items-center justify-between p-3 mb-2 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <img
                          src={image}
                          alt={symbol}
                          className="w-10 h-10 mr-2"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-700">
                            {userTransaction.amount}{" "}
                            {userTransaction.tokenSymbol}
                          </span>
                          <span className="flex items-center text-sm">
                            <a
                              target="_blank"
                              href={fromChainExplorerUrl}
                              rel="noreferrer"
                              className="text-hyphen-purple"
                            >
                              {userTransaction.fromChainLabel}
                            </a>
                            <HiOutlineArrowNarrowRight className="w-4 h-4 mx-1 text-gray-500" />
                            <a
                              target="_blank"
                              href={toChainExplorerUrl}
                              rel="noreferrer"
                              className="text-hyphen-purple"
                            >
                              {userTransaction.toChainLabel}
                            </a>
                          </span>
                        </div>
                      </div>
                      <button className="flex items-center p-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
                        Details
                        <HiOutlineArrowSmRight className="w-5 h-5 ml-1 -rotate-45" />
                      </button>
                    </li>
                  </ul>
                );
              })
            : null}
        </article>
      </div>
    </Modal>
  );
}

export default UserInfoModal;
