import { useEffect, useState } from 'react';
import { gql, NetworkStatus, useQuery } from '@apollo/client';
import { BigNumber, ethers } from 'ethers';
import { Dialog } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import { useWalletProvider } from 'context/WalletProvider';
import { apolloClients } from 'context/GraphQL';
import { IoMdClose } from 'react-icons/io';
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineArrowNarrowRight,
  HiOutlineArrowSmRight,
  HiOutlineRefresh,
} from 'react-icons/hi';
import Modal from '../../../../components/Modal';
import { getProviderInfo } from 'web3modal';
import { useChains } from 'context/Chains';
import { tokens } from '../../../../config/tokens';
import { ChainConfig } from '../../../../config/chains';
import TransactionDetailModal from '../TransactionDetailModal';
import useModal from 'hooks/useModal';
import { twMerge } from 'tailwind-merge';
import { DEFAULT_FIXED_DECIMAL_POINT } from 'config/constants';

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
  endTimeStamp: number;
  fromChainId: number;
  fromChainExplorerUrl: string;
  fromChainLabel: string;
  lpFee: string;
  rewardAmount: string;
  receivedTokenAddress: string;
  receivedTokenSymbol: string;
  receiver: string;
  startTimeStamp: number;
  toChainId: number;
  toChainExplorerUrl: string;
  toChainLabel: string;
  tokenSymbol: string;
  transferHash: string;
}

const USER_TRANSACTIONS = gql`
  query USER_TRANSACTIONS($address: String!) {
    deposits(where: { sender: $address }) {
      tokenAddress
      amount
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
  const [userTransactions, setUserTransactions] = useState<any>();
  const [transactionDetails, setTransactionDetails] =
    useState<ITransactionDetails>();
  const { accounts, disconnect, rawEthereumProvider } = useWalletProvider()!;
  const { chainsList, fromChain } = useChains()!;
  const { name: providerName } = getProviderInfo(rawEthereumProvider);
  const userAddress = accounts?.[0];
  const { data, loading, networkStatus, refetch } = useQuery(
    USER_TRANSACTIONS,
    {
      fetchPolicy: 'no-cache',
      notifyOnNetworkStatusChange: true,
      skip: !isVisible,
      variables: { address: userAddress },
    },
  );

  console.log(data);

  // useEffect(() => {
  //   function getTokenInfo(
  //     amount: number,
  //     tokenAddress: string,
  //     fromChainId: number
  //   ): { formattedAmount: string; symbol: string } {
  //     const tokenInfo = tokens.find((token) => {
  //       const { address } = token[fromChainId];
  //       return address.toLowerCase() === tokenAddress.toLowerCase();
  //     })!;
  //     const { decimal, symbol } = tokenInfo[fromChainId];
  //     const formattedAmount = (+ethers.utils.formatUnits(
  //       amount.toString(),
  //       decimal
  //     )).toFixed(DEFAULT_FIXED_DECIMAL_POINT);

  //     return { formattedAmount, symbol };
  //   }

  //   async function getTransferInfo(transactionId: string, toChainId: number) {
  //     const apolloClient = apolloClients[toChainId];
  //     const { data } = await apolloClient.query({
  //       query: FUNDS_TO_USER,
  //       variables: { depositHash: transactionId },
  //     });
  //     return data.fundsSentToUsers[0];
  //   }

  //   async function getUserTransactions(
  //     chainsList: ChainConfig[],
  //     data: { fundsDepositeds: ITransaction[] },
  //     fromChain: ChainConfig
  //   ) {
  //     const { chainId: fromChainId, name: fromChainLabel } = fromChain;
  //     const { fundsDepositeds } = data;
  //     let transformedTransactions = [];
  //     for (const transaction of fundsDepositeds) {
  //       const {
  //         id: transactionId,
  //         amount,
  //         receiver,
  //         toChainId: toChainIdAsString,
  //         tokenAddress: sentTokenAddress,
  //         timestamp: startTimeStamp,
  //       } = transaction;
  //       const { formattedAmount: sentAmount, symbol: sentTokenSymbol } =
  //         getTokenInfo(amount, sentTokenAddress, fromChainId);
  //       const toChainId = Number.parseInt(toChainIdAsString, 10);
  //       const { name: toChainLabel } = chainsList.find(
  //         (chain) => chain.chainId === toChainId
  //       )!;
  //       const {
  //         id: transferHash,
  //         feeEarned,
  //         tokenAddress: receivedTokenAddress,
  //         timestamp: endTimeStamp,
  //         transferredAmount,
  //       } = await getTransferInfo(transactionId, toChainId);
  //       const { formattedAmount: receivedAmount, symbol: receivedTokenSymbol } =
  //         getTokenInfo(transferredAmount, receivedTokenAddress, toChainId);
  //       const { formattedAmount: lpFee } = getTokenInfo(
  //         feeEarned,
  //         receivedTokenAddress,
  //         toChainId
  //       );

  //       const transactionDetails = {
  //         amount: sentAmount,
  //         amountReceived: receivedAmount,
  //         depositHash: transactionId,
  //         endTimeStamp: Number.parseInt(endTimeStamp, 10),
  //         fromChainLabel,
  //         fromChainId,
  //         lpFee,
  //         receivedTokenAddress,
  //         receivedTokenSymbol,
  //         receiver,
  //         startTimeStamp: Number.parseInt(startTimeStamp, 10),
  //         toChainId,
  //         toChainLabel,
  //         tokenSymbol: sentTokenSymbol,
  //         transferHash,
  //       };

  //       transformedTransactions.push(transactionDetails);
  //     }

  //     setUserTransactions(transformedTransactions);
  //   }

  //   if (data && fromChain) {
  //     getUserTransactions(chainsList, data, fromChain);
  //   }
  // }, [chainsList, data, fromChain]);

  const {
    isVisible: isTransactionDetailModalVisible,
    hideModal: hideTransactionDetailModal,
    showModal: showTransactionDetailModal,
  } = useModal();

  function handleWalletDisconnect() {
    disconnect();
    onClose();
  }

  function handleUserAddressCopy() {
    navigator.clipboard.writeText(userAddress || '');
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
    }, 1500);
  }

  function handleDetailsOpen(userTransaction: ITransactionDetails) {
    setTransactionDetails(userTransaction);
    showTransactionDetailModal();
  }

  function handleDetailsClose() {
    setTransactionDetails(undefined);
    hideTransactionDetailModal();
  }

  function handleTransactionsRefetch() {
    setUserTransactions(undefined);
    refetch();
  }

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="relative z-20 rounded-3xl border border-hyphen-purple-darker/50 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <Dialog.Title as="h1" className="text-xl font-semibold text-gray-700">
            Account
          </Dialog.Title>
          <button onClick={onClose} className="rounded hover:bg-gray-100">
            <IoMdClose className="h-6 w-auto text-gray-500" />
          </button>
        </div>

        <article className="mb-6 rounded-2xl border border-gray-200 p-4">
          <header className="mb-3 flex items-center justify-between">
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
          <p className="mb-2 text-lg text-gray-700">
            {userAddress?.slice(0, 6)}...{userAddress?.slice(-6)}
          </p>
          <button className="flex items-center" onClick={handleUserAddressCopy}>
            {addressCopied ? (
              <HiOutlineClipboardCheck className="mr-1 h-4 w-auto text-green-400" />
            ) : (
              <HiOutlineClipboardCopy className="mr-1 h-4 w-auto text-gray-500" />
            )}
            <span
              className={`text-sm ${
                addressCopied ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              {addressCopied ? 'Copied!' : 'Copy Address'}
            </span>
          </button>
        </article>

        <article>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg text-gray-700">Recent Transactions</h2>
            <button
              onClick={handleTransactionsRefetch}
              className="flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Refresh
              <HiOutlineRefresh
                className={twMerge(
                  'ml-1 h-4 w-4 text-gray-500',
                  networkStatus === NetworkStatus.refetch ? 'animate-spin' : '',
                )}
              />
            </button>
          </div>
          {loading ? (
            <Skeleton
              baseColor="#615ccd20"
              count={1}
              highlightColor="#615ccd05"
              height={60}
            />
          ) : null}

          {!loading && userTransactions && userTransactions.length === 0 ? (
            <span>No transactions found 😐</span>
          ) : null}

          {!loading && userTransactions && userTransactions.length > 0 ? (
            <ul>
              {userTransactions.map((userTransaction: ITransactionDetails) => {
                const { image, symbol } = tokens.find(
                  token => token.symbol === userTransaction.tokenSymbol,
                )!;
                const fromChainExplorerUrl = `${
                  chainsList.find(
                    chain => chain.chainId === userTransaction.fromChainId,
                  )!.explorerUrl
                }/tx/${userTransaction.depositHash}`;
                const toChainExplorerUrl = `${
                  chainsList.find(
                    chain => chain.chainId === userTransaction.toChainId,
                  )!.explorerUrl
                }/tx/${userTransaction.transferHash}`;

                return (
                  <li
                    className="mb-2 flex items-center justify-between p-2 last:mb-0"
                    key={userTransaction.depositHash}
                  >
                    <div className="flex items-center">
                      <img
                        src={image}
                        alt={symbol}
                        className="mr-4 h-10 w-10"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {userTransaction.amount} {userTransaction.tokenSymbol}
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
                          <HiOutlineArrowNarrowRight className="mx-1 h-4 w-4 text-gray-500" />
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
                    <button
                      className="flex items-center rounded-md p-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() =>
                        handleDetailsOpen({
                          ...userTransaction,
                          fromChainExplorerUrl,
                          toChainExplorerUrl,
                        })
                      }
                    >
                      Details
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </article>
      </div>

      <TransactionDetailModal
        isVisible={isTransactionDetailModalVisible}
        onClose={handleDetailsClose}
        transactionDetails={transactionDetails}
      />
    </Modal>
  );
}

export default UserInfoModal;
